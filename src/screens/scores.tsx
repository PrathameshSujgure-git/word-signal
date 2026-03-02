import React from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import { loadScores } from '../utils/storage.js';

interface ScoresScreenProps {
  onBack: () => void;
}

export function ScoresScreen({ onBack }: ScoresScreenProps) {
  const scores = loadScores();

  useInput(() => {
    onBack();
  });

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text color={colors.accent} bold>░░▒▒▓▓ HIGH SCORES ▓▓▒▒░░</Text>
      <Text> </Text>

      {scores.length === 0 ? (
        <Text color={colors.muted}>No scores yet. Go intercept some signals!</Text>
      ) : (
        <Box flexDirection="column">
          <Text color={colors.muted}>
            {'#'.padEnd(4)}{'SCORE'.padEnd(10)}{'LVL'.padEnd(6)}{'STREAK'.padEnd(9)}{'DATE'}
          </Text>
          {scores.map((s, i) => (
            <Text key={`score-${i}`}>
              <Text color={colors.primary}>{String(i + 1).padEnd(4)}</Text>
              <Text color={colors.warning}>{String(s.score).padEnd(10)}</Text>
              <Text color={colors.text}>{String(s.level).padEnd(6)}</Text>
              <Text color={colors.accent}>{String(s.streak).padEnd(9)}</Text>
              <Text color={colors.muted}>{s.date}</Text>
            </Text>
          ))}
        </Box>
      )}

      <Text> </Text>
      <Text color={colors.muted}>press any key to go back</Text>
    </Box>
  );
}
