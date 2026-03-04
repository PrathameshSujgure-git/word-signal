import React, { useState, useEffect, useRef } from 'react';
import { Text, useStdout } from 'ink';
import { colors } from '../theme.js';

// Block bar characters from shortest to tallest
const BARS = [' ', '\u2581', '\u2582', '\u2583', '\u2584', '\u2585', '\u2586', '\u2587', '\u2588'];
// ░▁▂▃▄▅▆▇█

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function NewsTicker() {
  const { stdout } = useStdout();
  const displayWidth = stdout?.columns ?? 80;
  const [tick, setTick] = useState(0);

  // Persistent wave state for smooth animation
  const barsRef = useRef<number[]>(Array.from({ length: displayWidth }, () => Math.random()));

  useEffect(() => {
    const id = setInterval(() => setTick(p => p + 1), 80);
    return () => clearInterval(id);
  }, []);

  // Generate frequency bars — layered sine waves + noise for organic feel
  const barCount = displayWidth - 6; // reserve space for "FREQ " label
  const bars: string[] = [];
  const barColors: string[] = [];

  for (let i = 0; i < barCount; i++) {
    const x = i / barCount;
    const t = tick * 0.15;

    // Layered waves
    const wave1 = Math.sin(x * 12 + t) * 0.3;
    const wave2 = Math.sin(x * 5.7 - t * 0.7) * 0.25;
    const wave3 = Math.sin(x * 20 + t * 1.3) * 0.15;

    // Smooth random drift
    const target = Math.random();
    barsRef.current[i] = lerp(barsRef.current[i]!, target, 0.08);
    const noise = barsRef.current[i]! * 0.3;

    const val = Math.max(0, Math.min(1, 0.5 + wave1 + wave2 + wave3 + noise - 0.15));
    const barIdx = Math.round(val * (BARS.length - 1));
    bars.push(BARS[barIdx]!);

    // Color by height: dim → green → cyan → white at peaks
    if (val > 0.75) barColors.push(colors.cyan);
    else if (val > 0.5) barColors.push(colors.green);
    else if (val > 0.25) barColors.push(colors.border);
    else barColors.push(colors.dim);
  }

  return (
    <Text backgroundColor={colors.bgTicker}>
      <Text color={colors.textDim}>FREQ </Text>
      {bars.map((bar, i) => (
        <Text key={i} color={barColors[i]}>{bar}</Text>
      ))}
      <Text color={colors.textDim}> </Text>
    </Text>
  );
}
