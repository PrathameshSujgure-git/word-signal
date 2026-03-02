import React from 'react';
import { Text, Box } from 'ink';
import { colors } from '../theme.js';

interface FreqChartProps {
  text: string;
}

export function FreqChart({ text }: FreqChartProps) {
  const freq = new Map<string, number>();
  for (const ch of text.toLowerCase()) {
    if (ch >= 'a' && ch <= 'z') {
      freq.set(ch, (freq.get(ch) ?? 0) + 1);
    }
  }

  const sorted = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  const maxCount = sorted.length > 0 ? sorted[0]![1] : 1;
  const maxBar = 10;

  return (
    <Box flexDirection="column">
      <Text color={colors.accent}>░░▒▒ FREQUENCY ANALYSIS ▒▒░░</Text>
      {sorted.map(([letter, count]) => {
        const barLen = Math.max(1, Math.round((count / maxCount) * maxBar));
        const bar = '█'.repeat(barLen);
        return (
          <Text key={letter}>
            <Text color={colors.primary}>{letter.toUpperCase()} </Text>
            <Text color={colors.accent}>{bar.padEnd(maxBar)}</Text>
            <Text color={colors.text}> {count}</Text>
          </Text>
        );
      })}
    </Box>
  );
}
