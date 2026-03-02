import React from 'react';
import { Text } from 'ink';
import { colors } from '../theme.js';
import { getStreakMultiplier } from '../engine/scoring.js';

interface ScoreBarProps {
  level: number;
  score: number;
  highScore: number;
  streak: number;
}

function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function ScoreBar({ level, score, highScore, streak }: ScoreBarProps) {
  const multiplier = getStreakMultiplier(streak);
  const streakColor = streak >= 3 ? colors.accent : colors.text;

  return (
    <Text>
      <Text color={colors.primary}>LVL:{level}</Text>
      <Text color={colors.text}>  </Text>
      <Text color={colors.warning}>SCORE:{formatNumber(score)}</Text>
      <Text color={colors.text}>  </Text>
      <Text color={colors.muted}>HIGH:{formatNumber(highScore)}</Text>
      <Text color={colors.text}>  </Text>
      <Text color={streakColor}>STREAK:{streak} x{multiplier}</Text>
    </Text>
  );
}
