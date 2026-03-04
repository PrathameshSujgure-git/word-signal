import React from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, borders } from '../theme.js';
import { loadScores } from '../utils/storage.js';
import { ScreenLayout } from '../components/screen-layout.js';

const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical, teeLeft, teeRight } = borders.double;

interface ScoresScreenProps {
  onBack: () => void;
}

export function ScoresScreen({ onBack }: ScoresScreenProps) {
  const scores = loadScores();

  useInput((_input, key) => {
    if (key.escape || key.return) onBack();
  });

  const w = 50;
  const inner = w - 2;
  const contentHeight = Math.min(16, 6 + scores.length);

  return (
    <ScreenLayout contentHeight={contentHeight} contentWidth={w}>
      <Box flexDirection="column">
        <Text color={colors.borderHi}>
          {topLeft}{horizontal.repeat(2)}
          <Text color={colors.amber} bold> HIGH SCORES </Text>
          {horizontal.repeat(inner - 16)}{topRight}
        </Text>

        {scores.length === 0 ? (
          <Text color={colors.borderHi}>
            {vertical}  <Text color={colors.textDim}>no scores yet. go decode some signals.</Text>
            {' '.repeat(Math.max(0, inner - 40))}{vertical}
          </Text>
        ) : (
          <>
            <Text color={colors.borderHi}>
              {vertical} <Text color={colors.textDim}>
                {'#'.padEnd(4)}{'SCORE'.padEnd(10)}{'LVL'.padEnd(6)}{'STREAK'.padEnd(9)}{'DATE'}
              </Text>{' '.repeat(Math.max(0, inner - 35))}{vertical}
            </Text>
            <Text color={colors.borderHi}>{teeLeft}{horizontal.repeat(inner)}{teeRight}</Text>
            {scores.map((s, i) => (
              <Text key={`score-${i}`} color={colors.borderHi}>
                {vertical} <Text color={colors.cyan} bold>{String(i + 1).padEnd(4)}</Text>
                <Text color={colors.amber}>{String(s.score).padEnd(10)}</Text>
                <Text color={colors.white}>{String(s.level).padEnd(6)}</Text>
                <Text color={colors.cyan}>{String(s.streak).padEnd(9)}</Text>
                <Text color={colors.textDim}>{s.date}</Text>
                {' '.repeat(Math.max(0, inner - 35))}{vertical}
              </Text>
            ))}
          </>
        )}

        <Text color={colors.borderHi}>{teeLeft}{horizontal.repeat(inner)}{teeRight}</Text>
        <Text color={colors.borderHi}>
          {vertical}  <Text color={colors.textDim}>press any key to go back</Text>
          {' '.repeat(Math.max(0, inner - 28))}{vertical}
        </Text>
        <Text color={colors.borderHi}>{bottomLeft}{horizontal.repeat(inner)}{bottomRight}</Text>
      </Box>
    </ScreenLayout>
  );
}
