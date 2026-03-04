import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors, borders, symbols } from '../theme.js';
import { ScreenLayout } from '../components/screen-layout.js';
import { playSound } from '../utils/sound.js';
import { getLevelConfig } from '../engine/difficulty.js';

const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical } = borders.double;

interface CountdownScreenProps {
  level: number;
  score: number;
  lives: number;
  maxLives: number;
  lastMessage?: string;
  onDone: () => void;
}

const messages = [
  'intercepting new signal',
  'decrypting transmission',
  'tracing signal origin',
  'bypassing encryption layer',
  'scanning frequency bands',
  'locking onto carrier wave',
  'extracting encoded payload',
  'synchronizing cipher keys',
];

export function CountdownScreen({ level, score, lives, maxLives, lastMessage, onDone }: CountdownScreenProps) {
  const [count, setCount] = useState(3);
  const [progress, setProgress] = useState(0);
  const [msg] = useState(() => messages[Math.floor(Math.random() * messages.length)]!);
  const config = getLevelConfig(level);

  useEffect(() => {
    playSound('levelup');
  }, []);

  // 1.5s total: 500ms per number (3→2→1→go)
  useEffect(() => {
    const id = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          setTimeout(onDone, 100);
          return 0;
        }
        playSound('tick');
        return prev - 1;
      });
    }, 500);
    return () => clearInterval(id);
  }, [onDone]);

  useEffect(() => {
    const total = 1500;
    const step = 30;
    const increment = step / total;
    const id = setInterval(() => {
      setProgress((prev) => Math.min(1, prev + increment));
    }, step);
    return () => clearInterval(id);
  }, []);

  const w = 48;
  const inner = w - 2;
  const barWidth = inner - 4;
  const filled = Math.round(progress * barWidth);
  const bar = symbols.barFilled.repeat(filled) + symbols.barEmpty.repeat(barWidth - filled);

  const heartsStr = Array.from({ length: maxLives }, (_, i) =>
    i < lives ? symbols.heartFull : symbols.heartEmpty
  ).join(' ');

  const contentHeight = lastMessage ? 12 : 11;

  return (
    <ScreenLayout contentHeight={contentHeight} contentWidth={w}>
      <Box flexDirection="column">
        <Text color={colors.borderHi}>
          {topLeft}{horizontal.repeat(2)}
          <Text color={colors.amber} bold> LEVEL {level} </Text>
          {horizontal.repeat(Math.max(0, inner - 12 - String(level).length))}{topRight}
        </Text>

        <Text color={colors.borderHi}>{vertical}{' '.repeat(inner)}{vertical}</Text>

        <Text color={colors.borderHi}>
          {vertical}  <Text color={colors.textDim}>SCORE </Text>
          <Text color={colors.amber} bold>{score.toLocaleString('en-US')}</Text>
          {'  '}
          <Text color={lives <= 2 ? colors.red : colors.green}>{heartsStr}</Text>
          {' '.repeat(Math.max(0, inner - 8 - score.toLocaleString('en-US').length - heartsStr.length))}{vertical}
        </Text>

        {lastMessage && (() => {
          const quoted = `"${lastMessage}"`;
          const truncated = quoted.length > inner - 4 ? quoted.slice(0, inner - 7) + '..."' : quoted;
          const msgPad = Math.max(0, inner - truncated.length - 4);
          return (
            <Text color={colors.borderHi}>
              {vertical}{'  '}<Text color={colors.green}>{truncated}</Text>{' '.repeat(msgPad)}  {vertical}
            </Text>
          );
        })()}

        {(() => {
          const briefing = `${config.minWords}-${config.maxWords} words \u00B7 ${config.timeLimit}s`;
          const briefPad = Math.max(0, inner - briefing.length - 4);
          return (
            <Text color={colors.borderHi}>
              {vertical}{'  '}<Text color={colors.cyan}>{briefing}</Text>{' '.repeat(briefPad)}  {vertical}
            </Text>
          );
        })()}

        <Text color={colors.borderHi}>
          {vertical}{' '.repeat(Math.floor((inner - 1) / 2))}
          <Text color={count > 0 ? colors.amber : colors.green} bold>
            {count > 0 ? String(count) : '\u25B8'}
          </Text>
          {' '.repeat(Math.ceil((inner - 1) / 2))}{vertical}
        </Text>

        <Text color={colors.borderHi}>{vertical}{' '.repeat(inner)}{vertical}</Text>

        <Text color={colors.borderHi}>
          {vertical}  <Text color={colors.cyan}>{bar}</Text>  {vertical}
        </Text>

        <Text color={colors.borderHi}>{vertical}{' '.repeat(inner)}{vertical}</Text>

        <Text color={colors.borderHi}>
          {vertical}  <Text color={colors.textDim}>{msg}...</Text>
          {' '.repeat(Math.max(0, inner - msg.length - 7))}  {vertical}
        </Text>

        <Text color={colors.borderHi}>{vertical}{' '.repeat(inner)}{vertical}</Text>

        <Text color={colors.borderHi}>{bottomLeft}{horizontal.repeat(inner)}{bottomRight}</Text>
      </Box>
    </ScreenLayout>
  );
}
