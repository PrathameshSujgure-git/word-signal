import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors, borders } from '../theme.js';
import { ScreenLayout } from '../components/screen-layout.js';
import { playSound } from '../utils/sound.js';

const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical, teeLeft, teeRight } = borders.double;

interface GameOverScreenProps {
  totalScore: number;
  highScore: number;
  isNewHigh: boolean;
  level: number;
  maxStreak: number;
  roundsPlayed: number;
  livesLost: boolean;
  lastPhrase?: string;
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
  livesLost,
  lastPhrase,
  onPlayAgain,
  onQuit,
}: GameOverScreenProps) {
  const [flashOn, setFlashOn] = useState(true);

  useEffect(() => {
    playSound('gameover');
  }, []);

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

  const w = 48;
  const inner = w - 2;
  // Truncate phrase to fit within the modal width
  const phraseDisplay = lastPhrase && lastPhrase.length > inner - 4
    ? lastPhrase.slice(0, inner - 7) + '...'
    : lastPhrase;
  const hasPhrase = !!phraseDisplay;
  // top(1) + livesLost?(1) + phrase?(2) + newHigh?(1) + divider(1) + stats(5) + divider(1) + tips(2) + divider(1) + controls(1) + bottom(1)
  let contentHeight = 14;
  if (livesLost) contentHeight += 1;
  if (isNewHigh) contentHeight += 1;
  if (hasPhrase) contentHeight += 2;

  // PU-style stat row with dot leaders
  const statRow = (label: string, val: string, valColor: string) => {
    const dotsLen = inner - 4 - label.length - val.length;
    const dots = dotsLen > 0 ? '\u00B7'.repeat(dotsLen) : ' ';
    return (
      <Text color={colors.borderHi}>
        {vertical}  <Text color={colors.textDim}>{label}</Text>
        <Text color={colors.border}>{dots}</Text>
        <Text color={valColor} bold>{val}</Text>  {vertical}
      </Text>
    );
  };

  return (
    <ScreenLayout contentHeight={contentHeight} contentWidth={w}>
      <Box flexDirection="column">
        {/* Amber border for outcome modal — PU style */}
        <Text color={colors.amber}>
          {topLeft}{horizontal.repeat(2)}
          <Text bold> SIGNAL TERMINATED </Text>
          {horizontal.repeat(inner - 22)}{topRight}
        </Text>

        {livesLost && (
          <Text color={colors.amber}>
            {vertical}  <Text color={colors.red}>all lives lost {'\u2014'} system shutdown</Text>
            {' '.repeat(Math.max(0, inner - 35))}{vertical}
          </Text>
        )}

        {hasPhrase && (
          <>
            <Text color={colors.amber}>
              {vertical}  <Text color={colors.textDim}>last signal:</Text>
              {' '.repeat(Math.max(0, inner - 15))}{vertical}
            </Text>
            <Text color={colors.amber}>
              {vertical}  <Text color={colors.cyan} bold>{phraseDisplay!.toUpperCase()}</Text>
              {' '.repeat(Math.max(0, inner - 2 - phraseDisplay!.length))}{vertical}
            </Text>
          </>
        )}

        {isNewHigh && (
          <Text color={colors.amber}>
            {vertical}  <Text color={flashOn ? colors.amber : colors.bg} bold>
              {'>>> NEW HIGH SCORE <<<'}
            </Text>
            {' '.repeat(Math.max(0, inner - 25))}{vertical}
          </Text>
        )}

        <Text color={colors.amber}>{teeLeft}{horizontal.repeat(inner)}{teeRight}</Text>

        {statRow('FINAL SCORE', totalScore.toLocaleString('en-US'), colors.amber)}
        {statRow('HIGH SCORE', highScore.toLocaleString('en-US'), colors.green)}
        {statRow('LEVEL', String(level), colors.white)}
        {statRow('MAX STREAK', String(maxStreak), colors.cyan)}
        {statRow('ROUNDS', String(roundsPlayed), colors.textDim)}

        <Text color={colors.amber}>{teeLeft}{horizontal.repeat(inner)}{teeRight}</Text>

        {/* Scoring tips */}
        <Text color={colors.amber}>
          {vertical}  <Text color={colors.textDim}>solve 60% to win {'\u00B7'} longer words = more pts</Text>
          {' '.repeat(Math.max(0, inner - 43))}{vertical}
        </Text>
        <Text color={colors.amber}>
          {vertical}  <Text color={colors.textDim}>time bonus if all solved {'\u00B7'} streaks multiply</Text>
          {' '.repeat(Math.max(0, inner - 45))}{vertical}
        </Text>

        <Text color={colors.amber}>{teeLeft}{horizontal.repeat(inner)}{teeRight}</Text>

        <Text color={colors.amber}>
          {vertical}  <Text color={colors.text}>Enter: play again</Text>
          {' '.repeat(Math.max(0, inner - 28))}
          <Text color={colors.text}>q: quit</Text>  {vertical}
        </Text>

        <Text color={colors.amber}>{bottomLeft}{horizontal.repeat(inner)}{bottomRight}</Text>
      </Box>
    </ScreenLayout>
  );
}
