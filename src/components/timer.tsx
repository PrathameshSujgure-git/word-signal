import React, { useState, useEffect, useCallback } from 'react';
import { Text } from 'ink';
import { colors } from '../theme.js';

interface TimerProps {
  duration: number;
  onExpire: () => void;
  paused?: boolean;
  onTick?: (remaining: number) => void;
}

export function Timer({ duration, onExpire, paused = false, onTick }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);

  const onExpireRef = React.useRef(onExpire);
  onExpireRef.current = onExpire;
  const onTickRef = React.useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setRemaining((prev) => {
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(id);
          onExpireRef.current();
          return 0;
        }
        onTickRef.current?.(next);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused]);

  const barWidth = 30;
  const ratio = remaining / duration;
  const filled = Math.round(barWidth * ratio);
  const empty = barWidth - filled;

  let barColor: string;
  if (ratio > 0.5) barColor = colors.success;
  else if (ratio > 0.25) barColor = colors.warning;
  else barColor = colors.danger;

  const filledBar = '█'.repeat(filled);
  const emptyBar = '░'.repeat(empty);

  return (
    <Text>
      <Text>⏱ </Text>
      <Text color={barColor}>{filledBar}</Text>
      <Text color={colors.muted}>{emptyBar}</Text>
      <Text color={barColor}> {remaining}s</Text>
    </Text>
  );
}
