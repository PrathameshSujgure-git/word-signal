import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';

const SCAN_LINE = '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓';

interface GameOverScreenProps {
  totalScore: number;
  highScore: number;
  isNewHigh: boolean;
  level: number;
  maxStreak: number;
  roundsPlayed: number;
  onPlayAgain: () => void;
  onQuit: () => void;
}

export function GameOverScreen({
  totalScore,
  highScore,
  isNewHigh,
  level,
  maxStreak,
  roundsPlayed,
  onPlayAgain,
  onQuit,
}: GameOverScreenProps) {
  const [flashOn, setFlashOn] = useState(true);

  useEffect(() => {
    if (!isNewHigh) return;
    const id = setInterval(() => {
      setFlashOn((prev) => !prev);
    }, 500);
    return () => clearInterval(id);
  }, [isNewHigh]);

  useInput((ch, key) => {
    if (key.return) {
      onPlayAgain();
    } else if (ch === 'q') {
      onQuit();
    }
  });

  return (
    <Box flexDirection="column" alignItems="center" paddingY={1}>
      <Text color={colors.danger} dimColor>{SCAN_LINE}</Text>
      <Text color={colors.danger} bold>{'  ▓▓ SIGNAL TERMINATED ▓▓  '}</Text>
      <Text color={colors.danger} dimColor>{SCAN_LINE}</Text>

      {isNewHigh && (
        <Box marginY={1}>
          <Text color={flashOn ? colors.warning : colors.bg} bold>
            {'★ ★ ★  NEW HIGH SCORE  ★ ★ ★'}
          </Text>
        </Box>
      )}

      <Box flexDirection="column" marginY={1}>
        <Text>
          <Text color={colors.muted}>FINAL SCORE:  </Text>
          <Text color={colors.warning} bold>{totalScore.toLocaleString('en-US')}</Text>
        </Text>
        <Text>
          <Text color={colors.muted}>HIGH SCORE:   </Text>
          <Text color={colors.primary}>{highScore.toLocaleString('en-US')}</Text>
        </Text>
        <Text>
          <Text color={colors.muted}>LEVEL:        </Text>
          <Text color={colors.text}>{level}</Text>
        </Text>
        <Text>
          <Text color={colors.muted}>MAX STREAK:   </Text>
          <Text color={colors.accent}>{maxStreak}</Text>
        </Text>
        <Text>
          <Text color={colors.muted}>ROUNDS:       </Text>
          <Text color={colors.text}>{roundsPlayed}</Text>
        </Text>
      </Box>

      <Box marginTop={1} flexDirection="column" alignItems="center">
        <Text color={colors.muted}>enter = play again • q = quit</Text>
      </Box>
    </Box>
  );
}
