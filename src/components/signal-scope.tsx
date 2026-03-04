import React, { useState, useEffect, useRef } from 'react';
import { Box, Text, useStdout } from 'ink';
import { colors, symbols } from '../theme.js';
import { useScopeEvents } from './scope-context.js';
import type { ScopeEvent } from './scope-context.js';

// Box-drawing characters for waveform trace
const TRACE = {
  top: {
    small: '╷',
    full: '│',
    heavy: '╽',
  },
  center: {
    baseline: '─',
    cross: '┼',
    heavyCross: '╫',
  },
  bottom: {
    small: '╵',
    full: '│',
    heavy: '╿',
  },
};

const GRID_DOT = symbols.dot;
const GRID_INTERVAL = 8;

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Gaussian spike: amplitude * exp(-(x-center)^2 / (2*sigma^2)) */
function gaussian(x: number, center: number, sigma: number): number {
  const d = x - center;
  return Math.exp(-(d * d) / (2 * sigma * sigma));
}

interface SpikeState {
  col: number;
  decay: number; // ticks remaining
  maxDecay: number;
}

interface AnimState {
  // Correct spike
  spikes: SpikeState[];
  // Wrong event
  noiseMult: number;
  noiseDecay: number;
  // Skip event
  flatTicks: number;
  // Flatline (permanent)
  flatline: boolean;
  // SNR level (0-1)
  snr: number;
}

export function SignalScope() {
  const { stdout } = useStdout();
  const width = stdout?.columns ?? 80;
  const scope = useScopeEvents();
  const [tick, setTick] = useState(0);

  // Persistent state via refs
  const noiseTargets = useRef<number[]>(Array.from({ length: width }, () => Math.random() * 2 - 1));
  const noiseValues = useRef<number[]>(Array.from({ length: width }, () => 0));
  const peakHold = useRef<number[]>(Array.from({ length: width }, () => 0));
  const animRef = useRef<AnimState>({
    spikes: [],
    noiseMult: 1,
    noiseDecay: 0,
    flatTicks: 0,
    flatline: false,
    snr: 0.75,
  });

  // Resize noise arrays if width changes
  useEffect(() => {
    const w = width;
    if (noiseTargets.current.length !== w) {
      noiseTargets.current = Array.from({ length: w }, () => Math.random() * 2 - 1);
      noiseValues.current = Array.from({ length: w }, () => 0);
      peakHold.current = Array.from({ length: w }, () => 0);
    }
  }, [width]);

  // 80ms tick
  useEffect(() => {
    const id = setInterval(() => setTick(p => p + 1), 80);
    return () => clearInterval(id);
  }, []);

  // Consume events each tick
  const events: ScopeEvent[] = scope ? scope.consumeEvents() : [];
  const anim = animRef.current;

  for (const ev of events) {
    switch (ev.type) {
      case 'correct': {
        const col = Math.floor(Math.random() * (width - 12)) + 6;
        anim.spikes.push({ col, decay: 8, maxDecay: 8 });
        break;
      }
      case 'wrong':
        anim.noiseMult = 3;
        anim.noiseDecay = 6;
        anim.snr = Math.max(0, anim.snr - 0.45);
        break;
      case 'skip':
        anim.flatTicks = 4;
        break;
      case 'flatline':
        anim.flatline = true;
        break;
    }
  }

  // Decay animation counters
  if (anim.noiseDecay > 0) {
    anim.noiseDecay--;
    if (anim.noiseDecay <= 0) anim.noiseMult = 1;
  }
  if (anim.flatTicks > 0) anim.flatTicks--;

  // Recover SNR toward 1.0
  anim.snr = Math.min(1, anim.snr + 0.05);

  // Decay spikes
  anim.spikes = anim.spikes.filter(s => {
    s.decay--;
    return s.decay > 0;
  });

  // Compute waveform samples
  const samples: number[] = [];
  const t = tick * 0.12;

  for (let i = 0; i < width; i++) {
    if (anim.flatline || anim.flatTicks > 0) {
      samples.push(0);
      continue;
    }

    const x = i / width;

    // Layered sine waves
    const w1 = Math.sin(x * 8.0 + t) * 0.35;
    const w2 = Math.sin(x * 13.7 - t * 0.6) * 0.2;
    const w3 = Math.sin(x * 23.1 + t * 1.4) * 0.12;
    const w4 = Math.sin(x * 3.2 - t * 0.3) * 0.15;

    // Smooth noise
    const noiseTarget = Math.random() * 2 - 1;
    noiseTargets.current[i] = lerp(noiseTargets.current[i]!, noiseTarget, 0.06);
    noiseValues.current[i] = lerp(noiseValues.current[i]!, noiseTargets.current[i]!, 0.12);
    const noise = noiseValues.current[i]! * 0.18 * anim.noiseMult;

    let val = w1 + w2 + w3 + w4 + noise;

    // Inject correct spikes
    for (const spike of anim.spikes) {
      const strength = spike.decay / spike.maxDecay;
      val += gaussian(i, spike.col, 3) * strength;
    }

    samples.push(clamp(val, -1, 1));
  }

  // Update peak hold (decay slowly)
  for (let i = 0; i < width; i++) {
    const abs = Math.abs(samples[i]!);
    if (abs > peakHold.current[i]!) {
      peakHold.current[i] = abs;
    } else {
      peakHold.current[i] = Math.max(0, peakHold.current[i]! - 0.04);
    }
  }

  const isWrongTint = anim.noiseDecay > 0;
  const traceColor = isWrongTint ? colors.red : colors.green;

  // Build rows 0-2 (waveform)
  const rowChars: Array<Array<{ ch: string; color: string }>> = [[], [], []];

  for (let i = 0; i < width; i++) {
    const s = samples[i]!;
    const absS = Math.abs(s);
    const pk = peakHold.current[i]!;
    const isGrid = i % GRID_INTERVAL === 0;

    // Determine which row gets the trace
    let traceRow: number;
    if (s > 0.33) traceRow = 0;
    else if (s < -0.33) traceRow = 2;
    else traceRow = 1;

    // Check if peak marker should show in a different row
    let peakRow = -1;
    if (pk > 0.33) peakRow = 0;
    else if (pk > 0.15) peakRow = 1;

    for (let r = 0; r < 3; r++) {
      if (r === traceRow) {
        // Draw trace character
        let ch: string;
        if (r === 0) {
          ch = absS > 0.66 ? TRACE.top.heavy : absS > 0.5 ? TRACE.top.full : TRACE.top.small;
        } else if (r === 1) {
          ch = absS > 0.2 ? TRACE.center.heavyCross : TRACE.center.cross;
        } else {
          ch = absS > 0.66 ? TRACE.bottom.heavy : absS > 0.5 ? TRACE.bottom.full : TRACE.bottom.small;
        }
        rowChars[r]!.push({ ch, color: traceColor });
      } else if (r === peakRow && peakRow !== traceRow) {
        // Peak hold marker
        const peakCh = '·';
        rowChars[r]!.push({ ch: peakCh, color: colors.cyan });
      } else if (r === 1) {
        // Center row baseline
        rowChars[r]!.push({ ch: isGrid ? '┈' : TRACE.center.baseline, color: colors.border });
      } else {
        // Empty rows get grid dots or space
        rowChars[r]!.push({ ch: isGrid ? GRID_DOT : ' ', color: colors.border });
      }
    }
  }

  // Build row 3 (data readout)
  const freq = (42.0 + Math.sin(tick * 0.02) * 5).toFixed(1);
  const peak = Math.max(...samples.map(Math.abs)).toFixed(2);
  const latency = (8 + Math.sin(tick * 0.03) * 4).toFixed(1);
  const snrLevel = anim.snr;
  const snrBarLen = 8;
  const snrFilled = Math.round(snrLevel * snrBarLen);
  const snrBar = symbols.barFilled.repeat(snrFilled) + symbols.barEmpty.repeat(snrBarLen - snrFilled);

  // Assemble readout segments
  const segments: Array<{ text: string; color: string }> = [
    { text: '╰ ', color: colors.borderHi },
    { text: `${freq}kHz`, color: colors.green },
    { text: ' ▸▸ ', color: colors.textDim },
    { text: 'LOCK', color: colors.green },
    { text: ' ─── ', color: colors.textDim },
    { text: `PK+${peak}`, color: colors.green },
    { text: ' ─── ', color: colors.textDim },
    { text: `δ${latency}ms`, color: colors.green },
    { text: ' ─── ', color: colors.textDim },
    { text: snrBar, color: colors.green },
    { text: ' SNR', color: colors.textDim },
  ];

  const closeBracket = ' ╯';
  const contentLen = segments.reduce((sum, s) => sum + s.text.length, 0) + closeBracket.length;
  const fillLen = Math.max(0, width - contentLen);
  // Insert fill before close bracket
  segments.push({ text: '─'.repeat(fillLen), color: colors.textDim });
  segments.push({ text: closeBracket, color: colors.borderHi });

  return (
    <Box flexDirection="column">
      {[0, 1, 2].map(r => (
        <Text key={r} backgroundColor={colors.bgTicker}>
          {rowChars[r]!.map((cell, i) => (
            <Text key={i} color={cell.color}>{cell.ch}</Text>
          ))}
        </Text>
      ))}
      <Text backgroundColor={colors.bgTicker}>
        {segments.map((seg, i) => (
          <Text key={i} color={seg.color}>{seg.text}</Text>
        ))}
      </Text>
    </Box>
  );
}
