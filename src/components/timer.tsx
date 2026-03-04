import React, { useState, useEffect, useRef } from 'react';
import { Text } from 'ink';
import { colors, symbols } from '../theme.js';
import { playSound } from '../utils/sound.js';

interface TimerProps {
  duration: number;
  onExpire: () => void;
  paused?: boolean;
  onTick?: (remaining: number) => void;
  barWidth?: number;
}

export function Timer({ duration, onExpire, paused = false, onTick, barWidth = 30 }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [blinkOn, setBlinkOn] = useState(true);
  const isLow = remaining <= 10;
  const isLowRef = useRef(isLow);
  isLowRef.current = isLow;

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;
  const expiredRef = useRef(false);

  // Single interval handles both countdown and blink
  useEffect(() => {
    // If already expired, fire onExpire immediately on unpause
    // (handles the case where timer expired while paused)
    if (expiredRef.current) {
      if (!paused) {
        setTimeout(() => onExpireRef.current(), 0);
      }
      return;
    }

    if (paused) return;

    let tickAccum = 0;
    const STEP = 500; // 500ms granularity — blink + countdown

    const id = setInterval(() => {
      tickAccum += STEP;

      // Blink toggle every 500ms — read from ref to avoid stale closure
      if (isLowRef.current) {
        setBlinkOn(prev => !prev);
      }

      // Countdown every 1000ms
      if (tickAccum % 1000 === 0) {
        setRemaining(prev => {
          const next = prev - 1;
          if (next <= 0) {
            clearInterval(id);
            expiredRef.current = true;
            setTimeout(() => onExpireRef.current(), 0);
            return 0;
          }
          if (next <= 10) playSound('tick');
          setTimeout(() => onTickRef.current?.(next), 0);
          return next;
        });
      }
    }, STEP);

    return () => clearInterval(id);
  }, [paused]); // eslint-disable-line react-hooks/exhaustive-deps

  const ratio = remaining / duration;
  const filled = Math.round(barWidth * ratio);
  const empty = barWidth - filled;

  let barColor: string;
  if (ratio > 0.5) barColor = colors.cyan;
  else if (ratio > 0.25) barColor = colors.amber;
  else barColor = colors.red;

  const filledBar = symbols.barFilled.repeat(filled);
  const emptyBar = symbols.barEmpty.repeat(empty);
  const min = Math.floor(remaining / 60);
  const sec = String(remaining % 60).padStart(2, '0');

  // Low time: blink between bar color and dim — never invisible
  const timerColor = isLow && !blinkOn ? colors.border : barColor;

  return (
    <Text>
      <Text color={colors.textDim}>TIME </Text>
      <Text color={barColor}>{filledBar}</Text>
      <Text color={colors.borderHi}>{emptyBar}</Text>
      <Text color={timerColor} bold={isLow}> {min}:{sec}</Text>
    </Text>
  );
}
