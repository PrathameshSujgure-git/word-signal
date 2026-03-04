#!/usr/bin/env tsx
/**
 * Generate WAV sound files for Signal Game v3.
 * Electric/synth style — cyberpunk arcade vibes.
 * Run: npx tsx src/utils/generate-sounds.ts
 * Output: assets/sounds/*.wav
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '../../assets/sounds');

const SAMPLE_RATE = 44100;
const CHANNELS = 1;
const BITS_PER_SAMPLE = 16;

function createWav(samples: Int16Array): Buffer {
  const dataSize = samples.length * 2;
  const buf = Buffer.alloc(44 + dataSize);
  buf.write('RIFF', 0);
  buf.writeUInt32LE(36 + dataSize, 4);
  buf.write('WAVE', 8);
  buf.write('fmt ', 12);
  buf.writeUInt32LE(16, 16);
  buf.writeUInt16LE(1, 20);
  buf.writeUInt16LE(CHANNELS, 22);
  buf.writeUInt32LE(SAMPLE_RATE, 24);
  buf.writeUInt32LE(SAMPLE_RATE * CHANNELS * BITS_PER_SAMPLE / 8, 28);
  buf.writeUInt16LE(CHANNELS * BITS_PER_SAMPLE / 8, 32);
  buf.writeUInt16LE(BITS_PER_SAMPLE, 34);
  buf.write('data', 36);
  buf.writeUInt32LE(dataSize, 40);
  for (let i = 0; i < samples.length; i++) {
    buf.writeInt16LE(samples[i]!, 44 + i * 2);
  }
  return buf;
}

// --- Oscillators ---
function sine(freq: number, t: number): number {
  return Math.sin(2 * Math.PI * freq * t);
}

function square(freq: number, t: number): number {
  return sine(freq, t) >= 0 ? 1 : -1;
}

function saw(freq: number, t: number): number {
  const phase = (freq * t) % 1;
  return 2 * phase - 1;
}

function noise(): number {
  return Math.random() * 2 - 1;
}

// Pulse wave with variable duty cycle
function pulse(freq: number, t: number, duty: number = 0.25): number {
  const phase = (freq * t) % 1;
  return phase < duty ? 1 : -1;
}

// --- Envelopes ---
function envelope(t: number, duration: number, attack = 0.008, release = 0.04): number {
  if (t < attack) return t / attack;
  if (t > duration - release) return Math.max(0, (duration - t) / release);
  return 1;
}

function expDecay(t: number, rate: number = 8): number {
  return Math.exp(-rate * t);
}

// --- Helpers ---
function makeSamples(durationMs: number, fn: (t: number) => number, volume = 0.3): Int16Array {
  const numSamples = Math.floor(SAMPLE_RATE * durationMs / 1000);
  const samples = new Int16Array(numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    const val = fn(t) * volume;
    samples[i] = Math.max(-32768, Math.min(32767, Math.round(val * 32767)));
  }
  return samples;
}

// ═══ SOUNDS ═══

// boot: Electric power-up — fast saw sweep + pulse crackle + resonant ping
function generateBoot(): Int16Array {
  return makeSamples(250, (t) => {
    const dur = 0.25;
    const env = envelope(t, dur, 0.003, 0.06);
    // Rising saw sweep 80→1200Hz
    const freq = 80 + 1200 * (t / dur) ** 1.5;
    const sweepSaw = saw(freq, t) * 0.4;
    // Pulse crackle at high freq
    const crackle = pulse(freq * 3, t, 0.15) * 0.15 * expDecay(t, 4);
    // Resonant ping at end
    const pingT = Math.max(0, t - 0.15);
    const ping = sine(1400, pingT) * expDecay(pingT, 20) * 0.3;
    return (sweepSaw + crackle + ping) * env;
  }, 0.3);
}

// correct: Electric zap confirmation — dual detuned pulse + sparkle
function generateCorrect(): Int16Array {
  return makeSamples(120, (t) => {
    const dur = 0.12;
    const env = envelope(t, dur, 0.002, 0.03);
    // Detuned pulse pair for thick electric tone
    const p1 = pulse(880, t, 0.3) * 0.3;
    const p2 = pulse(887, t, 0.3) * 0.3; // slightly detuned
    // High sparkle
    const sparkle = sine(2200, t) * expDecay(t, 25) * 0.25;
    // Quick octave jump at 40ms
    const jump = t > 0.04 ? sine(1760, t) * 0.2 * expDecay(t - 0.04, 15) : 0;
    return (p1 + p2 + sparkle + jump) * env;
  }, 0.25);
}

// wrong: Electric buzz/zap — distorted low square + noise burst
function generateWrong(): Int16Array {
  return makeSamples(180, (t) => {
    const dur = 0.18;
    const env = envelope(t, dur, 0.002, 0.04);
    // Harsh detuned squares
    const sq1 = square(110, t) * 0.35;
    const sq2 = square(113, t) * 0.35; // beating
    // Noise burst at start
    const noiseBurst = noise() * 0.25 * expDecay(t, 12);
    // Descending zap
    const zapFreq = 400 - 300 * (t / dur);
    const zap = saw(zapFreq, t) * 0.15 * expDecay(t, 6);
    return (sq1 + sq2 + noiseBurst + zap) * env;
  }, 0.2);
}

// tick: Electric click — sharp pulse pop + tiny ring
function generateTick(): Int16Array {
  return makeSamples(25, (t) => {
    const dur = 0.025;
    const env = envelope(t, dur, 0.001, 0.015);
    // Sharp pulse pop
    const pop = pulse(1500, t, 0.1) * 0.5 * expDecay(t, 60);
    // Tiny metallic ring
    const ring = sine(3200, t) * 0.3 * expDecay(t, 40);
    return (pop + ring) * env;
  }, 0.2);
}

// complete: Electric victory fanfare — ascending arp with saw+pulse, final shimmer
function generateComplete(): Int16Array {
  const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6
  const noteLen = 70; // ms each
  const shimmerLen = 150;
  const totalMs = notes.length * noteLen + shimmerLen;

  return makeSamples(totalMs, (t) => {
    const arpEnd = notes.length * noteLen / 1000;

    if (t < arpEnd) {
      const noteIdx = Math.min(Math.floor(t / (noteLen / 1000)), notes.length - 1);
      const noteT = t - noteIdx * (noteLen / 1000);
      const noteDur = noteLen / 1000;
      const env = envelope(noteT, noteDur, 0.003, 0.02);
      const freq = notes[noteIdx]!;
      // Electric tone: saw + pulse
      const sawTone = saw(freq, t) * 0.3;
      const pulseTone = pulse(freq, t, 0.25) * 0.2;
      const sparkle = sine(freq * 3, t) * 0.1 * expDecay(noteT, 15);
      return (sawTone + pulseTone + sparkle) * env;
    }

    // Shimmer tail
    const shimT = t - arpEnd;
    const shimEnv = expDecay(shimT, 7);
    const sh1 = sine(1319, shimT) * 0.2;
    const sh2 = sine(1325, shimT) * 0.2; // detune for chorus
    const sh3 = sine(2637, shimT) * 0.1; // octave up
    return (sh1 + sh2 + sh3) * shimEnv;
  }, 0.25);
}

// gameover: Electric shutdown — descending saw sweep + distortion crumble + power-down whine
function generateGameover(): Int16Array {
  return makeSamples(600, (t) => {
    const dur = 0.6;
    const env = envelope(t, dur, 0.005, 0.1);
    // Descending saw sweep
    const freq = 800 * Math.exp(-3 * t / dur);
    const sweepSaw = saw(freq, t) * 0.3;
    // Distortion crumble — square at sub-harmonic
    const crumble = square(freq / 3, t) * 0.2 * (1 - t / dur);
    // Power-down whine
    const whineFreq = 2000 * Math.exp(-5 * t / dur);
    const whine = sine(whineFreq, t) * 0.15 * expDecay(t, 3);
    // Noise crackle fading in
    const crackle = noise() * 0.1 * (t / dur) * expDecay(t - 0.3, 4);
    return (sweepSaw + crumble + whine + crackle) * env;
  }, 0.22);
}

// ═══ GENERATE ═══
mkdirSync(OUT_DIR, { recursive: true });

const sounds: Record<string, () => Int16Array> = {
  boot: generateBoot,
  correct: generateCorrect,
  wrong: generateWrong,
  tick: generateTick,
  complete: generateComplete,
  gameover: generateGameover,
};

for (const [name, generate] of Object.entries(sounds)) {
  const samples = generate();
  const wav = createWav(samples);
  const path = resolve(OUT_DIR, `${name}.wav`);
  writeFileSync(path, wav);
  console.log(`  ${name}.wav (${wav.length} bytes)`);
}

console.log('done.');
