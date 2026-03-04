import React from 'react';
import { Text } from 'ink';
import { colors } from '../theme.js';

// Original encryption pattern — scattered digits, symbols, sparse
const CHARS = '01234567890><!#$%&@.:;|/\\~*^{}[]()=+-_';

export interface RainSegment {
  text: string;
  bright: boolean;
  critter?: boolean;
  deadCritter?: boolean;
}

/**
 * Generate a row of sparse encryption scatter as a plain string.
 * density: 0-1, default 0.15. Lower = more spaces = less lag.
 */
export function generateRainString(width: number, density = 0.15): string {
  const row = new Array<string>(width);
  for (let i = 0; i < width; i++) {
    row[i] = Math.random() < density
      ? CHARS[(Math.random() * CHARS.length) | 0]!
      : ' ';
  }
  return row.join('');
}

/**
 * Convert a plain rain string into colored segments.
 * Optimized: fewer segments by only switching on bright spans.
 */
export function segmentize(row: string): RainSegment[] {
  const segments: RainSegment[] = [];
  let start = 0;
  while (start < row.length) {
    let end = start;
    let isBright = false;
    const ch = row[start]!;
    if (ch !== ' ' && Math.random() < 0.08) {
      isBright = true;
      while (end < row.length && row[end] !== ' ') end++;
    } else {
      while (end < row.length) {
        if (row[end] !== ' ' && Math.random() < 0.08) break;
        end++;
      }
    }
    segments.push({ text: row.slice(start, end), bright: isBright });
    start = end;
  }
  return segments;
}

/**
 * Overlay a critter's ASCII art into a rain string at position x.
 */
export function overlayCritter(row: string, x: number, art: string): string {
  if (x < 0 || x >= row.length) return row;
  const end = Math.min(x + art.length, row.length);
  return row.slice(0, x) + art.slice(0, end - x) + row.slice(end);
}

/**
 * Segment a rain string that may contain critter art.
 */
export function segmentizeWithCritters(
  row: string,
  critterRanges: Array<{ start: number; end: number; dead?: boolean }>,
): RainSegment[] {
  if (critterRanges.length === 0) return segmentize(row);

  const segments: RainSegment[] = [];
  let pos = 0;

  const sorted = [...critterRanges].sort((a, b) => a.start - b.start);

  for (const range of sorted) {
    if (pos < range.start) {
      segments.push(...segmentize(row.slice(pos, range.start)));
    }
    segments.push({
      text: row.slice(range.start, range.end),
      bright: false,
      critter: !range.dead,
      deadCritter: range.dead,
    });
    pos = range.end;
  }
  if (pos < row.length) {
    segments.push(...segmentize(row.slice(pos)));
  }
  return segments;
}

// Waterfall gradient colors — bright red cascading to dim crimson
const WATERFALL_GRADIENT = [
  '#ff3344',
  '#dd2233',
  '#bb1a2a',
  '#991122',
  '#770d1a',
  '#550a14',
  '#33060c',
];

const WATERFALL_CHARS = '░▒▓█│┃╽╿';

/**
 * Apply waterfall effect to a rain string.
 */
export function waterfallRow(row: string, intensity: number): string {
  const arr = row.split('');
  for (let i = 0; i < arr.length; i++) {
    if (Math.random() < intensity) {
      arr[i] = WATERFALL_CHARS[(Math.random() * WATERFALL_CHARS.length) | 0]!;
    }
  }
  return arr.join('');
}

export function getWaterfallColor(rowIndex: number, frontRow: number): string | null {
  const distance = frontRow - rowIndex;
  if (distance < 0 || distance >= WATERFALL_GRADIENT.length) return null;
  return WATERFALL_GRADIENT[distance]!;
}

export function getWaterfallIntensity(rowIndex: number, frontRow: number): number {
  const distance = frontRow - rowIndex;
  if (distance < 0 || distance >= WATERFALL_GRADIENT.length) return 0;
  return 0.6 - (distance * 0.08);
}

/** Render a single rain line from segments. Memoized to avoid re-renders from parent state changes. */
export const RainLine = React.memo(function RainLine({ segments, keyPrefix, waterfallColor }: { segments: RainSegment[]; keyPrefix: string; waterfallColor?: string | null }) {
  return (
    <Text>
      {segments.map((seg, j) => {
        let color: string;
        if (seg.deadCritter) {
          color = colors.red;
        } else if (waterfallColor) {
          color = waterfallColor;
        } else if (seg.critter) {
          color = colors.green;
        } else if (seg.bright) {
          color = colors.primary;
        } else {
          color = colors.border;
        }
        return (
          <Text
            key={`${keyPrefix}-${j}`}
            color={color}
            bold={seg.bright || seg.critter || seg.deadCritter || !!waterfallColor}
          >
            {seg.text}
          </Text>
        );
      })}
    </Text>
  );
});
