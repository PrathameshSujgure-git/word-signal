import React from 'react';
import { Text, Box } from 'ink';
import { colors, borders, symbols } from '../theme.js';
import { getStreakMultiplier } from '../engine/scoring.js';

const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical, teeLeft, teeRight } = borders.double;

interface ScorePanelProps {
  level: number;
  score: number;
  streak: number;
  lives: number;
  maxLives: number;
  timeLimit: number;
  lastRoundScore?: number;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export const ScorePanel = React.memo(function ScorePanel({ level, score, streak, lives, maxLives, timeLimit, lastRoundScore }: ScorePanelProps) {
  const multiplier = getStreakMultiplier(streak);
  const w = 20;
  const inner = w - 2;

  const heartsStr = Array.from({ length: maxLives }, (_, i) =>
    i < lives ? symbols.heartFull : symbols.heartEmpty
  ).join(' ');

  // PU-style row with dot leaders: "LABEL·····VALUE"
  const row = (label: string, val: string, valColor: string) => {
    const dotsLen = inner - 2 - label.length - val.length;
    const dots = dotsLen > 0 ? symbols.dot.repeat(dotsLen) : ' ';
    return (
      <Text color={colors.borderHi}>
        {vertical} <Text color={colors.textDim}>{label}</Text>
        <Text color={colors.border}>{dots}</Text>
        <Text color={valColor} bold>{val}</Text> {vertical}
      </Text>
    );
  };

  return (
    <Box flexDirection="column">
      <Text color={colors.borderHi}>
        {topLeft}{horizontal.repeat(2)}
        <Text color={colors.amber} bold> STATS </Text>
        {horizontal.repeat(inner - 10)}{topRight}
      </Text>
      {row('LVL', String(level), colors.white)}
      {row('PTS', formatNumber(score), colors.amber)}
      {row('STR', streak + (multiplier > 1 ? ` x${multiplier}` : ''), streak >= 3 ? colors.cyan : colors.textDim)}
      {row('TIME', `${timeLimit}s`, colors.textDim)}
      <Text color={colors.borderHi}>
        {teeLeft}{horizontal.repeat(inner)}{teeRight}
      </Text>
      <Box>
        <Text color={colors.borderHi}>{vertical} </Text>
        <Text color={lives <= 2 ? colors.red : colors.green}>
          {heartsStr}{' '.repeat(Math.max(0, inner - 2 - heartsStr.length))}
        </Text>
        <Text color={colors.borderHi}> {vertical}</Text>
      </Box>
      <Text color={colors.borderHi}>{vertical} <Text color={lastRoundScore !== undefined ? colors.green : colors.bg} bold>
        {(lastRoundScore !== undefined ? `+${formatNumber(lastRoundScore)}` : '').padEnd(inner - 2)}
      </Text> {vertical}</Text>
      <Text color={colors.borderHi}>{bottomLeft}{horizontal.repeat(inner)}{bottomRight}</Text>
    </Box>
  );
});
