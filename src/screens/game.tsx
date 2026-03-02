import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import { HUD, HUDRow, HUDDivider } from '../components/hud.js';
import { Transmission } from '../components/transmission.js';
import { ToolsPanel, type ToolState } from '../components/tools.js';
import { Timer } from '../components/timer.js';
import { FreqChart } from '../components/freq-chart.js';
import { ScoreBar } from '../components/scorebar.js';
import { encryptMessage, type EncryptedMessage } from '../engine/ciphers.js';
import { getLevelConfig } from '../engine/difficulty.js';
import { getRandomMessage } from '../engine/messages.js';
import { calculateScore, type ScoreResult } from '../engine/scoring.js';

const SCAN_LINE = '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓';

type Phase = 'playing' | 'substituting' | 'freq' | 'pattern';

interface GameScreenProps {
  onRoundEnd: (result: {
    score: ScoreResult;
    level: number;
    message: EncryptedMessage;
    guess: string;
    timeRemaining: number;
    won: boolean;
  }) => void;
  level: number;
  totalScore: number;
  highScore: number;
  streak: number;
}

export function GameScreen({ onRoundEnd, level, totalScore, highScore, streak }: GameScreenProps) {
  const config = useMemo(() => getLevelConfig(level), [level]);
  const [message] = useState<EncryptedMessage>(() =>
    encryptMessage(getRandomMessage(), config.cipherType)
  );

  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<Phase>('playing');
  const [subFrom, setSubFrom] = useState('');
  const [substitutions, setSubstitutions] = useState<Map<string, string>>(() => new Map());
  const [revealedWords, setRevealedWords] = useState<Set<number>>(() => new Set());
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimit);
  const [submitted, setSubmitted] = useState(false);
  const [tools, setTools] = useState<ToolState[]>(() => [
    { name: 'FREQ SCAN', key: '1', maxUses: config.freqScanUses, usesLeft: config.freqScanUses },
    { name: 'PATTERN', key: '2', maxUses: config.patternUses, usesLeft: config.patternUses },
    { name: 'SUBSTITUTE', key: '3', maxUses: config.substituteUses, usesLeft: config.substituteUses },
    { name: 'HINT', key: '4', maxUses: config.hintUses, usesLeft: config.hintUses },
  ]);

  const originalWords = useMemo(() => message.original.split(/\s+/), [message.original]);

  const submit = useCallback((guess: string, timeLeft: number) => {
    if (submitted) return;
    setSubmitted(true);
    const score = calculateScore(message.original, guess.toLowerCase(), timeLeft, streak);
    const won = score.accuracy >= 0.8;
    onRoundEnd({
      score,
      level,
      message,
      guess: guess.toLowerCase(),
      timeRemaining: timeLeft,
      won,
    });
  }, [submitted, message, streak, level, onRoundEnd]);

  const onTimerExpire = useCallback(() => {
    submit(input, 0);
  }, [submit, input]);

  const onTick = useCallback((remaining: number) => {
    setTimeRemaining(remaining);
  }, []);

  // Pattern analysis
  const patterns = useMemo(() => {
    const text = message.encrypted.toLowerCase().replace(/[^a-z]/g, '');
    const counts = new Map<string, number>();
    for (let len = 2; len <= 4; len++) {
      for (let i = 0; i <= text.length - len; i++) {
        const sub = text.substring(i, i + len);
        counts.set(sub, (counts.get(sub) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .filter(([, c]) => c >= 2)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [message.encrypted]);

  const decrementTool = useCallback((key: string) => {
    setTools((prev) =>
      prev.map((t) => (t.key === key ? { ...t, usesLeft: t.usesLeft - 1 } : t))
    );
  }, []);

  const getToolUses = useCallback((key: string) => {
    return tools.find((t) => t.key === key)?.usesLeft ?? 0;
  }, [tools]);

  useInput((ch, key) => {
    if (submitted) return;

    // Substituting phase
    if (phase === 'substituting') {
      if (key.escape) {
        setPhase('playing');
        setSubFrom('');
        return;
      }
      const letter = ch.toLowerCase();
      if (letter >= 'a' && letter <= 'z') {
        if (!subFrom) {
          setSubFrom(letter);
        } else {
          setSubstitutions((prev) => {
            const next = new Map(prev);
            next.set(subFrom, letter);
            return next;
          });
          decrementTool('3');
          setSubFrom('');
          setPhase('playing');
        }
      }
      return;
    }

    // Freq/pattern overlays — any key closes
    if (phase === 'freq' || phase === 'pattern') {
      setPhase('playing');
      return;
    }

    // Playing phase
    if (key.return) {
      submit(input, timeRemaining);
      return;
    }

    if (key.backspace || key.delete) {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    // Tool activation (only when input is empty)
    if (input === '' && ch >= '1' && ch <= '4') {
      if (ch === '1' && getToolUses('1') > 0) {
        decrementTool('1');
        setPhase('freq');
        return;
      }
      if (ch === '2' && getToolUses('2') > 0) {
        decrementTool('2');
        setPhase('pattern');
        return;
      }
      if (ch === '3' && getToolUses('3') > 0) {
        setPhase('substituting');
        return;
      }
      if (ch === '4' && getToolUses('4') > 0) {
        // Reveal a random unrevealed word
        const unrevealed = originalWords
          .map((_, i) => i)
          .filter((i) => !revealedWords.has(i));
        if (unrevealed.length > 0) {
          const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)]!;
          setRevealedWords((prev) => {
            const next = new Set(prev);
            next.add(idx);
            return next;
          });
          decrementTool('4');
        }
        return;
      }
    }

    // Regular character input
    if (ch && ch.length === 1 && !key.ctrl && !key.meta) {
      setInput((prev) => prev + ch);
    }
  });

  const activeTool = phase === 'freq' ? 'FREQ SCAN'
    : phase === 'pattern' ? 'PATTERN'
    : phase === 'substituting' ? 'SUBSTITUTE'
    : null;

  return (
    <Box flexDirection="column">
      <Text color={colors.primary} dimColor>{SCAN_LINE}</Text>

      <HUD>
        <HUDRow>
          <Transmission
            encrypted={message.encrypted}
            substitutions={substitutions}
            revealedWords={revealedWords}
            originalWords={originalWords}
          />
        </HUDRow>

        {phase === 'freq' && (
          <>
            <HUDDivider />
            <HUDRow>
              <FreqChart text={message.encrypted} />
            </HUDRow>
            <HUDRow>
              <Text color={colors.muted}>press any key to close</Text>
            </HUDRow>
          </>
        )}

        {phase === 'pattern' && (
          <>
            <HUDDivider />
            <HUDRow>
              <Box flexDirection="column">
                <Text color={colors.accent}>░░▒▒ PATTERN ANALYSIS ▒▒░░</Text>
                {patterns.length > 0 ? (
                  patterns.map(([pat, count]) => (
                    <Text key={pat}>
                      <Text color={colors.primary}>{pat.toUpperCase()} </Text>
                      <Text color={colors.accent}>{'█'.repeat(count)}</Text>
                      <Text color={colors.text}> x{count}</Text>
                    </Text>
                  ))
                ) : (
                  <Text color={colors.muted}>no repeated patterns found</Text>
                )}
              </Box>
            </HUDRow>
            <HUDRow>
              <Text color={colors.muted}>press any key to close</Text>
            </HUDRow>
          </>
        )}

        {phase === 'substituting' && (
          <>
            <HUDDivider />
            <HUDRow>
              <Text color={colors.accent}>
                {subFrom
                  ? `SWAP: ${subFrom.toUpperCase()} → type replacement letter...`
                  : 'SUBSTITUTE: type letter to replace...'}
              </Text>
            </HUDRow>
          </>
        )}

        <HUDDivider />
        <HUDRow>
          <ToolsPanel tools={tools} activeTool={activeTool} />
        </HUDRow>

        <HUDDivider />
        <HUDRow>
          <Text>
            <Text color={colors.primary}>{'> '}</Text>
            <Text color={colors.bright}>{input}</Text>
            <Text color={colors.primary}>_</Text>
          </Text>
        </HUDRow>
      </HUD>

      <Box marginY={0}>
        <Box marginRight={2}>
          <Timer
            duration={config.timeLimit}
            onExpire={onTimerExpire}
            paused={submitted}
            onTick={onTick}
          />
        </Box>
        <Text color={colors.accent}>STREAK: {streak}</Text>
      </Box>

      <ScoreBar level={level} score={totalScore} highScore={highScore} streak={streak} />

      <Text color={colors.muted}>
        cipher: {config.cipherType} • enter to submit • 1-4 tools
      </Text>
    </Box>
  );
}
