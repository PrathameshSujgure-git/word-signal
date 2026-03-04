import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Box, Text, useInput, useStdout } from 'ink';
import { colors } from '../theme.js';
import { HUD, HUDRow, HUDDivider } from '../components/hud.js';
import { PhraseDisplay, type PhraseWord, type WordGameState } from '../components/phrase-display.js';
import { ToolsPanel, ToolHelpModal, type ToolState } from '../components/tools.js';
import { Timer } from '../components/timer.js';
import { ScorePanel } from '../components/score-panel.js';
import { StatsForNerds } from '../components/stats-for-nerds.js';
import { ScreenLayout } from '../components/screen-layout.js';
import { useBlink } from '../hooks/use-blink.js';
import { scrambleMessage } from '../engine/ciphers.js';
import { getLevelConfig } from '../engine/difficulty.js';
import { getMessageForLevel } from '../engine/messages.js';
import { calculateScore, type ScoreResult } from '../engine/scoring.js';
import { playSound, isMuted } from '../utils/sound.js';
import { useScopeEvents } from '../components/scope-context.js';

interface GameScreenProps {
  onRoundEnd: (result: {
    score: ScoreResult;
    level: number;
    originalMessage: string;
    words: { original: string; solved: boolean; skipped: boolean; hinted: boolean }[];
    timeRemaining: number;
    won: boolean;
    wrongCount: number;
    livesLeft: number;
    skipUsed: number;
    firstUsed: number;
  }) => void;
  level: number;
  totalScore: number;
  streak: number;
  lives: number;
  maxLives: number;
  usedMessages: Set<string>;
  lastRoundScore?: number;
  gameSkipUses: number;
  gameFirstUses: number;
  showHelpOnMount?: boolean;
  onQuit: () => void;
  onToggleMute: () => void;
}

export function GameScreen({ onRoundEnd, level, totalScore, streak, lives: livesFromApp, maxLives, usedMessages, lastRoundScore, gameSkipUses, gameFirstUses, showHelpOnMount = false, onQuit, onToggleMute }: GameScreenProps) {
  const scope = useScopeEvents();
  const config = useMemo(() => getLevelConfig(level), [level]);
  const [message] = useState(() => {
    const text = getMessageForLevel(config.minWords, config.maxWords, config.maxWordLength, usedMessages);
    return scrambleMessage(text);
  });

  const [words, setWords] = useState<PhraseWord[]>(() =>
    message.words.map((w) => ({
      state: w,
      gameState: 'unsolved' as WordGameState,
    }))
  );

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const currentWordIndexRef = useRef(0);

  const [currentInput, setCurrentInput] = useState('');
  const currentInputRef = useRef('');
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimit);
  const [submitted, setSubmitted] = useState(false);
  const [skipPending, setSkipPending] = useState(false);
  const [toolUses, setToolUses] = useState(0);
  const skipUsedRef = useRef(0);
  const firstUsedRef = useRef(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [localLives, setLocalLives] = useState(livesFromApp);
  const cursorBlink = useBlink(500);
  const [showHelp, setShowHelp] = useState(showHelpOnMount);
  const [showStats, setShowStats] = useState(true);

  // ── Refs to avoid stale closures ──────────────────────────────────
  const localLivesRef = useRef(localLives);
  localLivesRef.current = localLives;
  const wrongCountRef = useRef(wrongCount);
  wrongCountRef.current = wrongCount;
  const submittedRef = useRef(submitted);
  submittedRef.current = submitted;
  const toolUsesRef = useRef(toolUses);       // FIX #1: ref for toolUses
  toolUsesRef.current = toolUses;
  const timeRemainingRef = useRef(timeRemaining); // FIX #5: ref for timeRemaining
  timeRemainingRef.current = timeRemaining;
  const wordsRef = useRef(words);             // FIX #4: ref for words
  wordsRef.current = words;
  currentWordIndexRef.current = currentWordIndex; // sync ref for stale closure safety
  const onRoundEndRef = useRef(onRoundEnd);   // FIX #3: ref for callback
  onRoundEndRef.current = onRoundEnd;

  // reveal=1/round, hint=5/round, first=4/game, skip=1/game
  const [tools, setTools] = useState<ToolState[]>(() => [
    { name: 'REVEAL', key: '1', maxUses: 1, usesLeft: 1 },
    { name: 'HINT', key: '2', maxUses: 5, usesLeft: 5 },
    { name: 'FIRST', key: '3', maxUses: gameFirstUses, usesLeft: gameFirstUses },
    { name: 'SKIP', key: '4', maxUses: gameSkipUses, usesLeft: gameSkipUses },
  ]);

  useEffect(() => {
    playSound('boot');
  }, []);

  const allDone = words.every((w) => w.gameState !== 'unsolved');

  // Track tool uses via ref to prevent double-spending on rapid keypresses
  const toolUsesLeftRef = useRef<Record<string, number>>({});
  if (Object.keys(toolUsesLeftRef.current).length === 0) {
    toolUsesLeftRef.current = { '1': 1, '2': 5, '3': gameFirstUses, '4': gameSkipUses };
  }

  const decrementTool = useCallback((key: string) => {
    toolUsesLeftRef.current[key] = (toolUsesLeftRef.current[key] ?? 0) - 1;
    setTools((prev) =>
      prev.map((t) => (t.key === key ? { ...t, usesLeft: t.usesLeft - 1 } : t))
    );
    setToolUses((prev) => prev + 1);
  }, []);

  const getToolUses = useCallback((key: string) => {
    return toolUsesLeftRef.current[key] ?? 0;
  }, []);

  const advanceToNextUnsolved = useCallback((fromIndex: number, updatedWords?: PhraseWord[]) => {
    const w = updatedWords ?? wordsRef.current;
    for (let i = fromIndex + 1; i < w.length; i++) {
      if (w[i]!.gameState === 'unsolved') {
        setCurrentWordIndex(i);
        currentWordIndexRef.current = i; // sync ref immediately
        currentInputRef.current = '';
        setCurrentInput('');
        return;
      }
    }
    setCurrentWordIndex(w.length);
    currentWordIndexRef.current = w.length;
    currentInputRef.current = '';
    setCurrentInput('');
  }, []);

  // FIX #1, #3, #5: finishRound reads everything from refs — no stale closures
  const finishRound = useCallback((timeLeft: number, overrideWords?: PhraseWord[]) => {
    if (submittedRef.current) return;
    setSubmitted(true);
    submittedRef.current = true;
    scope?.pushEvent('flatline');
    const finalWords = overrideWords ?? wordsRef.current;
    const wordData = finalWords.map((w) => ({
      original: w.state.original,
      solved: w.gameState === 'solved' || w.gameState === 'hinted',
      skipped: w.gameState === 'skipped' || w.gameState === 'wrong',
      hinted: w.gameState === 'hinted',
    }));
    const score = calculateScore(wordData, timeLeft, streak, toolUsesRef.current);
    if (score.won) {
      playSound('complete');
    }
    onRoundEndRef.current({
      score,
      level,
      originalMessage: message.original,
      words: wordData,
      timeRemaining: timeLeft,
      won: score.won,
      wrongCount: wrongCountRef.current,
      livesLeft: localLivesRef.current,
      skipUsed: skipUsedRef.current,
      firstUsed: firstUsedRef.current,
    });
  }, [streak, level, message]); // minimal deps — refs handle the rest

  // FIX #5: Auto-finish when all words done (but not if skip is pending — user confirms with SPACE)
  useEffect(() => {
    if (allDone && !submitted && !skipPending) {
      finishRound(timeRemainingRef.current);
    }
  }, [allDone, submitted, skipPending, finishRound]);

  // FIX #2: Guard onTimerExpire with submittedRef at the top
  const onTimerExpire = useCallback(() => {
    if (submittedRef.current) return;

    const currentWords = wordsRef.current;
    const unsolvedCount = currentWords.filter((w) => w.gameState === 'unsolved').length;
    if (unsolvedCount === 0) return;

    const newLives = localLivesRef.current - unsolvedCount;
    setLocalLives(newLives);
    localLivesRef.current = newLives;

    const newWrong = wrongCountRef.current + unsolvedCount;
    setWrongCount(newWrong);
    wrongCountRef.current = newWrong;

    playSound('wrong');
    scope?.pushEvent('wrong');

    const deadWords = currentWords.map((w) =>
      w.gameState === 'unsolved' ? { ...w, gameState: 'wrong' as const } : w
    );
    setWords(deadWords);
    finishRound(0, deadWords);
  }, [finishRound]); // FIX #4: reads words from ref

  const onTick = useCallback((remaining: number) => {
    setTimeRemaining(remaining);
  }, []);

  // checkWord reads ALL state from refs to avoid stale closures
  const checkWord = useCallback((input: string) => {
    const currentWords = wordsRef.current;
    const wordIdx = currentWordIndexRef.current;
    if (wordIdx >= currentWords.length) return;
    const currentWord = currentWords[wordIdx]!;
    if (currentWord.gameState !== 'unsolved') return;

    const typed = input.trim().toLowerCase();
    if (typed.length === 0) return;

    // Player must type the full word — revealed letters are just visual hints
    const isCorrect = typed === currentWord.state.original.toLowerCase();

    const newWords = currentWords.map((w, i) => {
      if (i !== wordIdx) return w;
      return { ...w, gameState: (isCorrect ? 'solved' : 'wrong') as WordGameState };
    });

    setWords(newWords);

    if (isCorrect) {
      playSound('correct');
      scope?.pushEvent('correct');
      advanceToNextUnsolved(wordIdx, newWords);
      return;
    }

    // Wrong word — lose exactly 1 life
    playSound('wrong');
    scope?.pushEvent('wrong');
    const newWrong = wrongCountRef.current + 1;
    setWrongCount(newWrong);
    wrongCountRef.current = newWrong;

    const newLives = localLivesRef.current - 1;
    setLocalLives(newLives);
    localLivesRef.current = newLives;

    if (newLives <= 0) {
      const deadWords = newWords.map((w) =>
        w.gameState === 'unsolved' ? { ...w, gameState: 'wrong' as const } : w
      );
      setWords(deadWords);
      finishRound(timeRemainingRef.current, deadWords);
      return;
    }

    advanceToNextUnsolved(wordIdx, newWords);
  }, [advanceToNextUnsolved, finishRound]);

  useInput((ch, key) => {
    // Global keybindings (work even when submitted)
    if (key.escape) { onQuit(); return; }
    if (ch === '5') { onToggleMute(); return; }
    if (ch === '0') { setShowStats(s => !s); return; }

    // Help modal — any key closes it
    if (showHelp) {
      setShowHelp(false);
      return;
    }

    if (submitted) return;

    // Toggle help
    if (ch === '6') {
      setShowHelp(true);
      return;
    }

    // Skip pending — only SPACE to continue
    if (skipPending) {
      if (ch === ' ') {
        setSkipPending(false);
        finishRound(timeRemainingRef.current);
      }
      return;
    }

    // Tab — jump to next unsolved word, Shift+Tab — jump to previous
    if (key.tab) {
      const currentWords = wordsRef.current;
      const curIdx = currentWordIndexRef.current;
      const jumpTo = (i: number) => {
        setCurrentWordIndex(i);
        currentWordIndexRef.current = i;
        currentInputRef.current = '';
        setCurrentInput('');
      };
      if (key.shift) {
        for (let i = curIdx - 1; i >= 0; i--) {
          if (currentWords[i]!.gameState === 'unsolved') { jumpTo(i); return; }
        }
        for (let i = currentWords.length - 1; i > curIdx; i--) {
          if (currentWords[i]!.gameState === 'unsolved') { jumpTo(i); return; }
        }
      } else {
        for (let i = curIdx + 1; i < currentWords.length; i++) {
          if (currentWords[i]!.gameState === 'unsolved') { jumpTo(i); return; }
        }
        for (let i = 0; i < curIdx; i++) {
          if (currentWords[i]!.gameState === 'unsolved') { jumpTo(i); return; }
        }
      }
      return;
    }

    if (ch === ' ') {
      checkWord(currentInputRef.current);
      currentInputRef.current = '';
      setCurrentInput('');
      return;
    }

    // Enter also submits on the last unsolved word
    if (key.return) {
      const remaining = wordsRef.current.filter((w) => w.gameState === 'unsolved');
      if (remaining.length <= 1) {
        checkWord(currentInputRef.current);
        currentInputRef.current = '';
        setCurrentInput('');
      }
      return;
    }

    if (key.backspace || key.delete) {
      if (currentInputRef.current.length > 0) {
        currentInputRef.current = currentInputRef.current.slice(0, -1);
        setCurrentInput(currentInputRef.current);
        playSound('backspace');
      }
      return;
    }

    if (ch >= '1' && ch <= '4') {
      if (ch === '1' && getToolUses('1') > 0) {
        const currentWords = wordsRef.current;
        const unsolved = currentWords
          .map((w, i) => ({ w, i }))
          .filter(({ w }) => w.gameState === 'unsolved');
        if (unsolved.length > 0) {
          // Hint = reveal ALL letters of a random word (player must still type it)
          const { i: idx } = unsolved[Math.floor(Math.random() * unsolved.length)]!;
          const newWords = currentWords.map((w, j) => {
            if (j !== idx) return w;
            const allRevealed = new Set<number>();
            for (let p = 0; p < w.state.original.length; p++) allRevealed.add(p);
            return { ...w, state: { ...w.state, revealedPositions: allRevealed } };
          });
          setWords(newWords);
          decrementTool('1');
          playSound('correct');
          scope?.pushEvent('correct');
        }
        return;
      }

      if (ch === '2' && getToolUses('2') > 0) {
        const currentWords = wordsRef.current;
        const fw = currentWords[currentWordIndex];
        if (fw && fw.gameState === 'unsolved') {
          const unrevealed: number[] = [];
          for (let i = 0; i < fw.state.original.length; i++) {
            if (!fw.state.revealedPositions.has(i) && !(fw.state.firstRevealed && i === 0)) {
              unrevealed.push(i);
            }
          }
          if (unrevealed.length > 0) {
            const pos = unrevealed[Math.floor(Math.random() * unrevealed.length)]!;
            setWords((prev) => prev.map((w, j) => {
              if (j !== currentWordIndex) return w;
              const newRevealed = new Set(w.state.revealedPositions);
              newRevealed.add(pos);
              return { ...w, state: { ...w.state, revealedPositions: newRevealed } };
            }));
            decrementTool('2');
            playSound('correct');
            scope?.pushEvent('correct');
          }
        }
        return;
      }

      if (ch === '3' && getToolUses('3') > 0) {
        setWords((prev) => prev.map((w) => {
          if (w.gameState !== 'unsolved') return w;
          return { ...w, state: { ...w.state, firstRevealed: true } };
        }));
        decrementTool('3');
        firstUsedRef.current += 1;
        playSound('correct');
        scope?.pushEvent('correct');
        return;
      }

      if (ch === '4' && getToolUses('4') > 0) {
        const currentWords = wordsRef.current;
        const hasUnsolved = currentWords.some(w => w.gameState === 'unsolved');
        if (hasUnsolved) {
          // Skip entire phrase — mark all unsolved as skipped, no life lost
          const newWords = currentWords.map((w) =>
            w.gameState === 'unsolved' ? { ...w, gameState: 'skipped' as const } : w
          );
          setWords(newWords);
          decrementTool('4');
          skipUsedRef.current += 1;
          currentInputRef.current = '';
          setCurrentInput('');
          setSkipPending(true);
          playSound('tick');
          scope?.pushEvent('skip');
        }
        return;
      }
    }

    if (ch && ch.length === 1 && !key.ctrl && !key.meta && /[a-zA-Z]/.test(ch)) {
      currentInputRef.current += ch.toLowerCase();
      setCurrentInput(currentInputRef.current);
      playSound('keypress');
    }
  });

  const { stdout } = useStdout();
  const termWidth = stdout?.columns ?? 80;
  const statsWidth = 22;
  const hudWidth = 56;
  const totalContentWidth = hudWidth + statsWidth;
  const timerBarWidth = hudWidth - 8;
  const muted = isMuted();

  const muteLabel = muted ? 'unmute' : 'mute';
  const headerRight = `5:${muteLabel}  Esc:quit`;
  const headerGap = Math.max(2, totalContentWidth - 6 - headerRight.length);

  // header(1) + HUD(8: border+hint+phrase2+blank+divider+tools1+border) + timer(1) = 10
  // ScorePanel = 9, so max(10, 9) + header(1) = 11
  // Help modal needs ~14 rows
  const contentHeight = showHelp ? 17 : 12;

  const wordsSolved = words.filter(w => w.gameState === 'solved' || w.gameState === 'hinted').length;
  const statsOverlayNode = showStats ? (
    <StatsForNerds
      level={level}
      score={totalScore}
      streak={streak}
      lives={localLives}
      maxLives={maxLives}
      wordsSolved={wordsSolved}
      wordsTotal={words.length}
      wrongCount={wrongCount}
      toolUses={toolUses}
    />
  ) : undefined;

  // Timer must stay mounted to preserve countdown state — render it
  // off-screen (height 0) when help is showing so it stays paused but alive
  return (
    <ScreenLayout contentHeight={contentHeight} contentWidth={totalContentWidth} statsOverlay={statsOverlayNode}>
      {/* Timer — always mounted, hidden when help is open */}
      <Box height={showHelp ? 0 : undefined} overflowY="hidden">
        <Box flexDirection="column">
          {/* Header bar — PU style: amber label left, dim controls right */}
          <Box>
            <Text color={colors.amber} bold>SIGNAL</Text>
            <Text>{' '.repeat(headerGap)}</Text>
            <Text color={colors.textDim}>{headerRight}</Text>
          </Box>

          {/* Main content: HUD (left) + Stats (right) */}
          <Box flexDirection="row">
            <Box flexDirection="column" width={hudWidth}>
              <HUD title={`LEVEL ${level}`} width={hudWidth}>
                {skipPending && (
                  <HUDRow width={hudWidth}>
                    <Text color={colors.amber} bold>SKIPPED — press SPACE to continue</Text>
                  </HUDRow>
                )}

                <HUDRow width={hudWidth}>
                  <PhraseDisplay
                    words={words}
                    currentWordIndex={currentWordIndex}
                    currentInput={currentInput}
                    cursorVisible={cursorBlink}
                  />
                </HUDRow>

                <HUDRow width={hudWidth}>
                  <Text> </Text>
                </HUDRow>

                <HUDDivider width={hudWidth} />

                <HUDRow width={hudWidth}>
                  <ToolsPanel tools={tools} />
                </HUDRow>
              </HUD>

              <Box>
                <Timer
                  duration={config.timeLimit}
                  onExpire={onTimerExpire}
                  paused={submitted || skipPending || showHelp}
                  onTick={onTick}
                  barWidth={timerBarWidth}
                />
              </Box>
            </Box>

            <ScorePanel
              level={level}
              score={totalScore}
              streak={streak}
              lives={localLives}
              maxLives={maxLives}
              timeLimit={config.timeLimit}
              lastRoundScore={lastRoundScore}
            />
          </Box>
        </Box>
      </Box>

      {showHelp && (
        <ToolHelpModal
          tools={tools}
          gameSkipUses={gameSkipUses}
          gameFirstUses={gameFirstUses}
        />
      )}
    </ScreenLayout>
  );
}
