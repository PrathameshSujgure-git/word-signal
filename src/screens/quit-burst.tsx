import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useStdout, useApp } from 'ink';

const WASH_CHARS = '░▒▓█│┃╽╿';

// White-green gradient: bright white front → green → dim green tail
const GRADIENT = [
  '#ffffff',
  '#ccffcc',
  '#88ff88',
  '#44dd44',
  '#22bb22',
  '#118811',
  '#0a550a',
  '#053305',
];

const TAIL_LEN = GRADIENT.length;

/**
 * Waterfall overlay that sweeps top→bottom, eating the UI in place.
 * Children stay at their natural position — the waterfall is rendered
 * as an absolute overlay that only covers rows it has reached.
 */
export function QuitWaterfall({ children }: { children: React.ReactNode }) {
  const { exit } = useApp();
  const { stdout } = useStdout();
  const w = stdout?.columns ?? 80;
  const h = stdout?.rows ?? 24;
  const [front, setFront] = useState(-1);
  const done = useRef(false);

  useEffect(() => {
    const start = setTimeout(() => setFront(0), 80);
    return () => clearTimeout(start);
  }, []);

  useEffect(() => {
    if (front < 0) return;
    const id = setInterval(() => {
      setFront(f => {
        const next = f + 2;
        if (next > h + TAIL_LEN + 4) {
          clearInterval(id);
          if (!done.current) {
            done.current = true;
            process.stdout.write('\x1b[2J\x1b[H');
            setTimeout(() => exit(), 50);
          }
          return f;
        }
        return next;
      });
    }, 35);
    return () => clearInterval(id);
  }, [exit, h, front >= 0]); // eslint-disable-line react-hooks/exhaustive-deps

  if (front < 0) {
    return <>{children}</>;
  }

  // Build waterfall overlay rows for rows 0..min(front, h-1)
  const overlayRows: React.ReactNode[] = [];
  for (let row = 0; row < h; row++) {
    const dist = front - row;
    if (dist < 0) break; // below the front — stop

    if (dist >= TAIL_LEN) {
      // Already eaten — blank
      overlayRows.push(<Text key={`q-${row}`}>{' '.repeat(w)}</Text>);
      continue;
    }

    // Gradient zone
    const color = GRADIENT[dist]!;
    const intensity = 0.8 - dist * 0.09;
    let line = '';
    for (let c = 0; c < w; c++) {
      if (Math.random() < intensity) {
        line += WASH_CHARS[(Math.random() * WASH_CHARS.length) | 0];
      } else {
        line += ' ';
      }
    }
    overlayRows.push(<Text key={`q-${row}`} color={color} bold={dist < 3}>{line}</Text>);
  }

  return (
    <Box width={w} height={h} flexDirection="column">
      {/* Children at natural position underneath */}
      <Box position="absolute" flexDirection="column">
        {children}
      </Box>
      {/* Waterfall overlay on top — only covers reached rows */}
      <Box position="absolute" flexDirection="column">
        {overlayRows}
      </Box>
    </Box>
  );
}
