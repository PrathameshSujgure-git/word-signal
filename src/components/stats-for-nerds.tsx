import React, { useState, useEffect, useRef } from 'react';
import { Text, Box } from 'ink';
import { colors, borders, symbols } from '../theme.js';
import { getStreakMultiplier } from '../engine/scoring.js';

const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical } = borders.single;

const PANEL_WIDTH = 34;
const INNER = PANEL_WIDTH - 2;

const CIPHERS = ['ROT-13+SWAP', 'VIGENERE-7', 'CAESAR-Δ', 'XOR-FF', 'ENIGMA-M3'] as const;

interface StatsForNerdsProps {
  level: number;
  score: number;
  streak: number;
  lives: number;
  maxLives: number;
  wordsSolved: number;
  wordsTotal: number;
  wrongCount: number;
  toolUses: number;
}

function formatCommas(n: number): string {
  return n.toLocaleString('en-US');
}

function formatUptime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

interface StatRowProps {
  label: string;
  value: string;
  valueColor: string;
}

function StatRow({ label, value, valueColor }: StatRowProps) {
  const contentLen = label.length + value.length;
  const padLen = INNER - 2 - contentLen;
  const dots = padLen > 0 ? symbols.dot.repeat(padLen) : ' ';
  return (
    <Text color={colors.borderHi}>
      {vertical} <Text color={colors.textDim}>{label}</Text>
      <Text color={colors.border}>{dots}</Text>
      <Text color={valueColor}>{value}</Text> {vertical}
    </Text>
  );
}

export function StatsForNerds({
  level,
  score,
  streak,
  lives,
  maxLives,
  wordsSolved,
  wordsTotal,
  wrongCount,
  toolUses,
}: StatsForNerdsProps) {
  const [tick, setTick] = useState(0);
  const mountTime = useRef(Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Real stats
  const multiplier = getStreakMultiplier(streak);
  const streakVal = streak >= 3 ? `${streak} (x${multiplier})` : String(streak);

  const heartsStr = Array.from({ length: maxLives }, (_, i) =>
    i < lives ? symbols.heartFull : symbols.heartEmpty
  ).join('');

  const wordsVal = `${wordsSolved}/${wordsTotal} solved`;

  // Fake stats
  const cipher = CIPHERS[level % 5];
  const freq = `${(42.0 + Math.sin(tick * 0.02) * 5).toFixed(1)} kHz`;
  const decodeRate = `${(800 + Math.sin(tick * 0.07) * 80).toFixed(0)} sym/s`;
  const entropy = `${(2.5 + level * 0.3 + Math.sin(tick * 0.04) * 0.2).toFixed(2)} bits`;
  const latency = `${(8 + Math.sin(tick * 0.03) * 4).toFixed(1)} ms`;
  const packetLoss = `${(0.1 + Math.sin(tick * 0.05) * 0.15).toFixed(1)}%`;
  const elapsed = Math.floor((Date.now() - mountTime.current) / 1000);
  const uptime = formatUptime(elapsed);

  // Title bar
  const titleStr = ' Stats for Nerds ';
  const afterTitle = INNER - 1 - titleStr.length;
  const topBar = (
    <Text color={colors.borderHi}>
      {topLeft}
      <Text color={colors.amber} bold>{titleStr}</Text>
      {horizontal.repeat(Math.max(0, afterTitle))}{topRight}
    </Text>
  );

  // Hearts row — special rendering for colors
  const livesLabel = 'Lives';
  const heartsDotLen = INNER - 2 - livesLabel.length - heartsStr.length;
  const heartsDots = heartsDotLen > 0 ? symbols.dot.repeat(heartsDotLen) : ' ';

  return (
    <Box flexDirection="column">
      {topBar}
      <StatRow label="Level / Round" value={String(level)} valueColor={colors.text} />
      <StatRow label="Score" value={formatCommas(score)} valueColor={colors.text} />
      <StatRow label="Streak" value={streakVal} valueColor={colors.text} />
      {/* Hearts row with colored hearts */}
      <Text color={colors.borderHi}>
        {vertical} <Text color={colors.textDim}>{livesLabel}</Text>
        <Text color={colors.border}>{heartsDots}</Text>
        {Array.from({ length: maxLives }, (_, i) => (
          <Text key={i} color={i < lives ? colors.green : (lives <= 2 ? colors.red : colors.border)}>
            {i < lives ? symbols.heartFull : symbols.heartEmpty}
          </Text>
        ))}
        {' '}{vertical}
      </Text>
      <StatRow label="Words" value={wordsVal} valueColor={colors.text} />
      <StatRow label="Wrong Count" value={String(wrongCount)} valueColor={colors.text} />
      <StatRow label="Tools Used" value={String(toolUses)} valueColor={colors.text} />
      <StatRow label="Cipher" value={cipher} valueColor={colors.green} />
      <StatRow label="Signal Freq" value={freq} valueColor={colors.green} />
      <StatRow label="Decode Rate" value={decodeRate} valueColor={colors.green} />
      <StatRow label="Entropy" value={entropy} valueColor={colors.green} />
      <StatRow label="Latency" value={latency} valueColor={colors.green} />
      <StatRow label="Packet Loss" value={packetLoss} valueColor={colors.green} />
      <StatRow label="Uptime" value={uptime} valueColor={colors.green} />
      <Text color={colors.borderHi}>{bottomLeft}{horizontal.repeat(INNER)}{bottomRight}</Text>
    </Box>
  );
}
