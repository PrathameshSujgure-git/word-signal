import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import type { ScoreResult } from '../engine/scoring.js';

const GLITCH_CHARS = '█▓▒░╬╠╣';

interface ResultScreenProps {
  result: ScoreResult;
  won: boolean;
  originalMessage: string;
  guess: string;
  onContinue: () => void;
}

function randomGlitch(len: number): string {
  return Array.from({ length: len }, () =>
    GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
  ).join('');
}

export function ResultScreen({ result, won, originalMessage, guess, onContinue }: ResultScreenProps) {
  const [glitching, setGlitching] = useState(true);
  const [glitchText, setGlitchText] = useState(randomGlitch(30));

  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setGlitchText(randomGlitch(30));
    }, 80);

    const timer = setTimeout(() => {
      setGlitching(false);
      clearInterval(glitchInterval);
    }, 500);

    return () => {
      clearTimeout(timer);
      clearInterval(glitchInterval);
    };
  }, []);

  useInput((_ch, key) => {
    if (!glitching && key.return) {
      onContinue();
    }
  });

  if (glitching) {
    const headerColor = won ? colors.success : colors.danger;
    const headerText = won ? 'TRANSMISSION DECODED' : 'SIGNAL LOST';
    return (
      <Box flexDirection="column" alignItems="center" paddingY={2}>
        <Text color={headerColor}>{glitchText}</Text>
        <Text color={headerColor} bold>{headerText}</Text>
        <Text color={headerColor}>{glitchText}</Text>
      </Box>
    );
  }

  const headerColor = won ? colors.success : colors.danger;
  const headerText = won ? '▓▓ TRANSMISSION DECODED ▓▓' : '▓▓ SIGNAL LOST ▓▓';
  const accuracyPct = Math.round(result.accuracy * 100);

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text color={headerColor} bold>{headerText}</Text>
      <Text> </Text>

      <Text color={colors.muted}>ORIGINAL:</Text>
      <Text color={colors.bright}>{originalMessage}</Text>
      <Text> </Text>

      <Text color={colors.muted}>YOUR GUESS:</Text>
      <Text color={result.perfect ? colors.success : colors.warning}>{guess || '(empty)'}</Text>
      <Text> </Text>

      <Text color={colors.accent}>── SCORE BREAKDOWN ──</Text>
      <Text>
        <Text color={colors.text}>  Words:      </Text>
        <Text color={colors.warning}>{result.wordScore}</Text>
      </Text>
      <Text>
        <Text color={colors.text}>  Time Bonus: </Text>
        <Text color={colors.warning}>{result.timeBonus}</Text>
      </Text>
      <Text>
        <Text color={colors.text}>  Multiplier: </Text>
        <Text color={colors.accent}>x{result.multiplier}</Text>
      </Text>
      <Text>
        <Text color={colors.text}>  Total:      </Text>
        <Text color={colors.primary} bold>{result.total}</Text>
      </Text>
      <Text>
        <Text color={colors.text}>  Accuracy:   </Text>
        <Text color={accuracyPct >= 80 ? colors.success : colors.danger}>{accuracyPct}%</Text>
      </Text>
      <Text> </Text>

      <Text color={colors.muted}>press enter to continue</Text>
    </Box>
  );
}
