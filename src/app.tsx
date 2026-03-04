import React, { useState, useCallback, useRef } from 'react';
import { TitleScreen } from './screens/title.js';
import { GameScreen } from './screens/game.js';
import { CountdownScreen } from './screens/countdown.js';
import { GameOverScreen } from './screens/gameover.js';
import { ScoresScreen } from './screens/scores.js';
import { getHighScore, saveScore } from './utils/storage.js';
import { setMuted, isMuted } from './utils/sound.js';
import type { ScoreResult } from './engine/scoring.js';
import { ScopeProvider } from './components/scope-context.js';
import { QuitWaterfall } from './screens/quit-burst.js';

export type Screen = 'title' | 'game' | 'countdown' | 'gameover' | 'scores';

const MAX_LIVES = 7;

interface RoundResult {
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
}

export function App() {
  const [screen, setScreen] = useState<Screen>('title');
  const [quitting, setQuitting] = useState(false);
  const [highScore, setHighScore] = useState(() => getHighScore());
  const [level, setLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [lives, setLives] = useState(MAX_LIVES);
  const [lastRoundScore, setLastRoundScore] = useState<number | undefined>(undefined);
  const [lastOriginalMessage, setLastOriginalMessage] = useState<string | undefined>(undefined);
  const [muted, setMutedState] = useState(() => isMuted());
  const [gameSkipUses, setGameSkipUses] = useState(1);    // 1 skip for entire game
  const [gameFirstUses, setGameFirstUses] = useState(4);  // 4 first-letter for entire game
  const usedMessagesRef = useRef<Set<string>>(new Set());

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      setMuted(!prev);
      return !prev;
    });
  }, []);

  const resetGame = useCallback(() => {
    setLevel(1);
    setTotalScore(0);
    setStreak(0);
    setMaxStreak(0);
    setRoundsPlayed(0);
    setLives(MAX_LIVES);
    setLastRoundScore(undefined);
    setLastOriginalMessage(undefined);
    setGameSkipUses(1);
    setGameFirstUses(4);
    usedMessagesRef.current = new Set();
  }, []);

  const goToGameOver = useCallback((currentTotal: number, currentLevel: number, currentMaxStreak: number) => {
    const currentHigh = getHighScore();
    const isNewHigh = currentTotal > currentHigh;
    saveScore({
      score: currentTotal,
      level: currentLevel,
      streak: currentMaxStreak,
      date: new Date().toISOString().split('T')[0]!,
    });
    if (isNewHigh) {
      setHighScore(currentTotal);
    }
    setScreen('gameover');
  }, []);

  // FIX #3: Use functional updaters to avoid stale closures over state
  const handleRoundEnd = useCallback((result: RoundResult) => {
    setRoundsPlayed((prev) => prev + 1);

    setTotalScore((prevTotal) => {
      const newTotal = prevTotal + result.score.total;

      // Sync lives and game-wide tool uses
      setLives(result.livesLeft);
      setLastRoundScore(result.score.total);
      setLastOriginalMessage(result.originalMessage);
      if (result.skipUsed > 0) setGameSkipUses(prev => Math.max(0, prev - result.skipUsed));
      if (result.firstUsed > 0) setGameFirstUses(prev => Math.max(0, prev - result.firstUsed));
      usedMessagesRef.current.add(result.originalMessage);

      setStreak((prevStreak) => {
        const newStreak = result.won ? prevStreak + 1 : 0;

        setMaxStreak((prevMax) => {
          const newMaxStreak = Math.max(prevMax, newStreak);

          // Out of lives → game over
          if (result.livesLeft <= 0) {
            setLevel((currentLevel) => {
              goToGameOver(newTotal, currentLevel, newMaxStreak);
              return currentLevel;
            });
          } else {
            setLevel((prev) => prev + 1);
            setScreen('countdown');
          }

          return newMaxStreak;
        });

        return newStreak;
      });

      return newTotal;
    });
  }, [goToGameOver]);

  const handlePlayAgain = useCallback(() => {
    resetGame();
    setHighScore(getHighScore());
    setScreen('title');
  }, [resetGame]);

  const startQuit = useCallback(() => setQuitting(true), []);

  // Render the current screen content
  let content: React.ReactNode = null;

  if (screen === 'title') {
    content = (
      <ScopeProvider>
        <TitleScreen
          highScore={highScore}
          onPlay={() => {
            resetGame();
            setScreen('game');
          }}
          onScores={() => setScreen('scores')}
          onQuit={startQuit}
        />
      </ScopeProvider>
    );
  } else if (screen === 'countdown') {
    content = (
      <ScopeProvider>
        <CountdownScreen
          level={level}
          score={totalScore}
          lives={lives}
          maxLives={MAX_LIVES}
          lastMessage={lastOriginalMessage}
          onDone={() => setScreen('game')}
        />
      </ScopeProvider>
    );
  } else if (screen === 'game') {
    content = (
      <ScopeProvider>
        <GameScreen
          key={`level-${level}-${roundsPlayed}`}
          onRoundEnd={handleRoundEnd}
          level={level}
          totalScore={totalScore}
          streak={streak}
          lives={lives}
          maxLives={MAX_LIVES}
          usedMessages={usedMessagesRef.current}
          lastRoundScore={lastRoundScore}
          gameSkipUses={gameSkipUses}
          gameFirstUses={gameFirstUses}
          showHelpOnMount={level === 1}
          onQuit={() => { resetGame(); setScreen('title'); }}
          onToggleMute={toggleMute}
        />
      </ScopeProvider>
    );
  } else if (screen === 'gameover') {
    content = (
      <ScopeProvider>
        <GameOverScreen
          totalScore={totalScore}
          highScore={highScore}
          isNewHigh={totalScore >= highScore && highScore > 0}
          level={level}
          maxStreak={maxStreak}
          roundsPlayed={roundsPlayed}
          livesLost={lives <= 0}
          lastPhrase={lastOriginalMessage}
          onPlayAgain={handlePlayAgain}
          onQuit={startQuit}
        />
      </ScopeProvider>
    );
  } else if (screen === 'scores') {
    content = <ScopeProvider><ScoresScreen onBack={() => setScreen('title')} /></ScopeProvider>;
  }

  // Wrap with waterfall when quitting — the existing UI stays visible
  // and gets eaten row-by-row as the waterfall sweeps down
  if (quitting) {
    return <QuitWaterfall>{content}</QuitWaterfall>;
  }

  return <>{content}</>;
}
