import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Box, Text, useStdout } from 'ink';
import { colors } from '../theme.js';
import { generateRainString, segmentizeWithCritters, overlayCritter, waterfallRow, getWaterfallColor, getWaterfallIntensity, RainLine } from './matrix-rain.js';

import { SignalScope } from './signal-scope.js';

// --- ASCII Critters ---
interface CritterDef {
  left: string;
  right: string;
  dead: string;    // death frame
}

const CRITTER_DEFS: CritterDef[] = [
  // Fish
  { left: '>°)',   right: '(°<',   dead: 'x_x' },
  { left: "><'>",  right: "<'><",  dead: "x'x" },
  // Cat
  { left: '=^.^=', right: '=^.^=', dead: '=x.x=' },
  // Robot
  { left: '[°_°]', right: '[°_°]', dead: '[x_x]' },
  // Bunny (from image)
  { left: '(\\/)o.O', right: 'O.o(\\/)', dead: '(\\/)x.x' },
  // Frog (from image)
  { left: '{O.O}',  right: '{O.O}',  dead: '{x.x}' },
  // Bug
  { left: '/bg\\',  right: '/bg\\',  dead: '/xx\\' },
  // Spider
  { left: '/\\o/\\', right: '/\\o/\\', dead: '/\\x/\\' },
  // Bird
  { left: '>(°>',  right: '<°)<',  dead: '<x>x' },
  // Snail
  { left: '@/',    right: '\\@',   dead: '@x' },
  // Mouse
  { left: '<:3)~', right: '~(E:>', dead: '<:x)~' },
  // Crab
  { left: 'V(°°)V', right: 'V(°°)V', dead: 'V(xx)V' },
  // Alien
  { left: '(o_O)', right: '(O_o)', dead: '(x_x)' },
  // Bat
  { left: '/V\\',  right: '/V\\',  dead: '/X\\' },
];

// How many critters to have active at once
const ACTIVE_CRITTER_COUNT = 8;

type CritterZone = 'top' | 'bottom' | 'left' | 'right';

interface Critter {
  art: string;
  x: number;
  row: number;      // row index within its zone
  dx: number;       // +1 or -1
  zone: CritterZone;
  defIdx: number;   // index into CRITTER_DEFS
  dead: boolean;     // killed by waterfall
  deadTicks: number; // how many ticks since death (for respawn)
}

function randomZone(): CritterZone {
  const zones: CritterZone[] = ['top', 'bottom', 'left', 'right'];
  return zones[Math.floor(Math.random() * zones.length)]!;
}

function pickRandomDef(): number {
  return Math.floor(Math.random() * CRITTER_DEFS.length);
}

function initCritter(defIdx: number, maxRows: Record<CritterZone, number>, maxWidths: Record<CritterZone, number>): Critter {
  const def = CRITTER_DEFS[defIdx]!;
  const zone = randomZone();
  const dx = Math.random() < 0.5 ? 1 : -1;
  const art = dx > 0 ? def.right : def.left;
  const width = maxWidths[zone] || 80;
  const rows = maxRows[zone] || 1;
  return {
    art,
    x: Math.floor(Math.random() * Math.max(1, width - art.length)),
    row: Math.floor(Math.random() * Math.max(1, rows)),
    dx,
    zone,
    defIdx,
    dead: false,
    deadTicks: 0,
  };
}

function advanceCritter(c: Critter, maxRows: Record<CritterZone, number>, maxWidths: Record<CritterZone, number>): Critter {
  // Dead critters show death frame, then respawn after 3 ticks as a new random critter
  if (c.dead) {
    if (c.deadTicks >= 3) {
      return initCritter(pickRandomDef(), maxRows, maxWidths);
    }
    return { ...c, deadTicks: c.deadTicks + 1 };
  }

  const width = maxWidths[c.zone] || 80;
  let newX = c.x + c.dx;

  // Wrap or pick new row/zone
  if (newX < 0 || newX + c.art.length > width) {
    const def = CRITTER_DEFS[c.defIdx]!;
    const newDx = -c.dx;
    const newArt = newDx > 0 ? def.right : def.left;
    if (Math.random() < 0.3) {
      return initCritter(pickRandomDef(), maxRows, maxWidths);
    }
    newX = Math.max(0, Math.min(newX, width - newArt.length));
    return { ...c, x: newX, dx: newDx, art: newArt };
  }
  return { ...c, x: newX };
}

interface ScreenLayoutProps {
  children: React.ReactNode;
  contentHeight: number;
  contentWidth?: number;
  showTicker?: boolean;
  statsOverlay?: React.ReactNode;
}

/**
 * Full-screen layout: encryption scatter fills the entire terminal,
 * content is centered with scatter as side margins, ticker pinned at bottom.
 */
export function ScreenLayout({
  children,
  contentHeight,
  contentWidth,
  statsOverlay,
  showTicker = true,
}: ScreenLayoutProps) {
  const { stdout } = useStdout();
  const termWidth = stdout?.columns ?? 80;
  const termHeight = stdout?.rows ?? 24;

  const tickerHeight = showTicker ? 4 : 0;
  const availableHeight = termHeight - tickerHeight;
  const topRows = Math.max(0, Math.floor((availableHeight - contentHeight) / 2));
  const bottomRows = Math.max(0, availableHeight - contentHeight - topRows);

  const [tick, setTick] = useState(0);
  // Waterfall state: -1 = inactive, 0+ = wave front row index
  const [waterfallFront, setWaterfallFront] = useState(-1);
  const waterfallTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const waterfallActive = waterfallFront >= 0;
  const totalScreenRows = topRows + contentHeight + bottomRows;

  const leftMargin = contentWidth ? Math.max(0, Math.floor((termWidth - contentWidth) / 2)) : 0;
  const rightMargin = contentWidth ? Math.max(0, termWidth - contentWidth - leftMargin) : 0;

  // Critter zone dimensions
  const zoneRows: Record<CritterZone, number> = useMemo(() => ({
    top: topRows,
    bottom: bottomRows,
    left: contentHeight,
    right: contentHeight,
  }), [topRows, bottomRows, contentHeight]);

  const zoneWidths: Record<CritterZone, number> = useMemo(() => ({
    top: termWidth,
    bottom: termWidth,
    left: leftMargin,
    right: rightMargin,
  }), [termWidth, leftMargin, rightMargin]);

  // Initialize critters once — pick random defs
  const crittersRef = useRef<Critter[] | null>(null);
  if (crittersRef.current === null) {
    crittersRef.current = Array.from({ length: ACTIVE_CRITTER_COUNT }, () =>
      initCritter(pickRandomDef(), zoneRows, zoneWidths)
    );
  }

  // Helper to get absolute row for a critter
  const getAbsCritterRow = (c: Critter): number => {
    if (c.zone === 'top') return c.row;
    if (c.zone === 'left' || c.zone === 'right') return topRows + c.row;
    return topRows + contentHeight + c.row;
  };

  useEffect(() => {
    const id = setInterval(() => {
      // Advance critters + check waterfall kills
      if (crittersRef.current) {
        crittersRef.current = crittersRef.current.map(c => {
          // Check if waterfall just hit this critter
          if (!c.dead && waterfallFront >= 0) {
            const absRow = getAbsCritterRow(c);
            if (absRow >= waterfallFront - 1 && absRow <= waterfallFront + 1) {
              const def = CRITTER_DEFS[c.defIdx]!;
              return { ...c, dead: true, deadTicks: 0, art: def.dead };
            }
          }
          return advanceCritter(c, zoneRows, zoneWidths);
        });
      }
      // Advance waterfall front
      setWaterfallFront((prev) => (prev >= 0 ? prev + 2 : prev));
      setTick((prev) => prev + 1);
    }, 200);
    return () => clearInterval(id);
  }, [zoneRows, zoneWidths, waterfallFront, topRows, contentHeight]);

  // Waterfall effect: triggers every 3-6s, wave sweeps top-to-bottom
  useEffect(() => {
    function scheduleWaterfall() {
      const delay = 3000 + Math.random() * 3000; // 3-6s
      waterfallTimerRef.current = setTimeout(() => {
        setWaterfallFront(0); // start from top
      }, delay);
    }
    scheduleWaterfall();
    return () => {
      if (waterfallTimerRef.current) clearTimeout(waterfallTimerRef.current);
    };
  }, []);

  // Advance waterfall front each tick
  useEffect(() => {
    if (waterfallFront < 0) return;
    // Wave tail length = 7 (gradient length). Done when front passes all rows + tail.
    if (waterfallFront > totalScreenRows + 7) {
      setWaterfallFront(-1);
      // Schedule next waterfall
      const delay = 3000 + Math.random() * 3000;
      waterfallTimerRef.current = setTimeout(() => {
        setWaterfallFront(0);
      }, delay);
      return;
    }
  }, [waterfallFront, totalScreenRows]);

  // Group critters by zone and row
  const critters = crittersRef.current!;
  const crittersByZoneRow = useMemo(() => {
    const map: Record<string, Critter[]> = {};
    for (const c of critters) {
      const key = `${c.zone}-${c.row}`;
      (map[key] ??= []).push(c);
    }
    return map;
  }, [tick]); // eslint-disable-line react-hooks/exhaustive-deps

  // Map zone + local row index to absolute screen row for waterfall
  function getAbsoluteRow(zone: CritterZone, localRow: number): number {
    if (zone === 'top') return localRow;
    if (zone === 'left' || zone === 'right') return topRows + localRow;
    return topRows + contentHeight + localRow; // bottom
  }

  // Generate scatter rows with critter overlays + optional waterfall
  function buildRainSegments(zone: CritterZone, rowCount: number, width: number) {
    return Array.from({ length: rowCount }, (_, i) => {
      const absRow = getAbsoluteRow(zone, i);
      const wfIntensity = waterfallActive ? getWaterfallIntensity(absRow, waterfallFront) : 0;
      let rowStr = generateRainString(width);
      if (wfIntensity > 0) rowStr = waterfallRow(rowStr, wfIntensity);
      const key = `${zone}-${i}`;
      const zoneCritters = crittersByZoneRow[key] ?? [];
      const ranges: Array<{ start: number; end: number; dead?: boolean }> = [];
      for (const c of zoneCritters) {
        rowStr = overlayCritter(rowStr, c.x, c.art);
        ranges.push({ start: c.x, end: Math.min(c.x + c.art.length, width), dead: c.dead });
      }
      const wfColor = waterfallActive ? getWaterfallColor(absRow, waterfallFront) : null;
      return { segments: segmentizeWithCritters(rowStr, ranges), waterfallColor: wfColor };
    });
  }

  const topRain = useMemo(
    () => buildRainSegments('top', topRows, termWidth),
    [tick, topRows, termWidth, waterfallFront] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const bottomRain = useMemo(
    () => buildRainSegments('bottom', bottomRows, termWidth),
    [tick, bottomRows, termWidth, waterfallFront] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const leftRain = useMemo(
    () => leftMargin > 0 ? buildRainSegments('left', contentHeight, leftMargin) : [],
    [tick, leftMargin, contentHeight, waterfallFront] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const rightRain = useMemo(
    () => rightMargin > 0 ? buildRainSegments('right', contentHeight, rightMargin) : [],
    [tick, rightMargin, contentHeight, waterfallFront] // eslint-disable-line react-hooks/exhaustive-deps
  );

  return (
    <Box flexDirection="column" width={termWidth} height={termHeight} overflowY="hidden">
      {/* Top scatter — overlay stats in top-right if provided */}
      {statsOverlay ? (
        <Box flexDirection="row">
          <Box flexDirection="column" flexGrow={1}>
            {topRain.map((row, i) => (
              <RainLine key={`tr-${i}`} segments={row.segments} keyPrefix={`tr-${i}`} waterfallColor={row.waterfallColor} />
            ))}
          </Box>
          <Box flexDirection="column" position="absolute" marginLeft={termWidth - 36}>
            {statsOverlay}
          </Box>
        </Box>
      ) : (
        topRain.map((row, i) => (
          <RainLine key={`tr-${i}`} segments={row.segments} keyPrefix={`tr-${i}`} waterfallColor={row.waterfallColor} />
        ))
      )}

      {/* Content with side scatter */}
      {contentWidth ? (
        <Box flexDirection="column">
          <Box flexDirection="row">
            <Box flexDirection="column">
              {leftRain.map((row, i) => (
                <RainLine key={`lr-${i}`} segments={row.segments} keyPrefix={`lr-${i}`} waterfallColor={row.waterfallColor} />
              ))}
            </Box>
            <Box flexDirection="column" width={contentWidth}>
              {children}
            </Box>
            <Box flexDirection="column">
              {rightRain.map((row, i) => (
                <RainLine key={`rr-${i}`} segments={row.segments} keyPrefix={`rr-${i}`} waterfallColor={row.waterfallColor} />
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        <Box flexDirection="column" width={termWidth}>
          {children}
        </Box>
      )}

      {/* Bottom scatter */}
      {bottomRain.map((row, i) => (
        <RainLine key={`br-${i}`} segments={row.segments} keyPrefix={`br-${i}`} waterfallColor={row.waterfallColor} />
      ))}

      {/* Ticker pinned at bottom */}
      {showTicker && <SignalScope />}
    </Box>
  );
}
