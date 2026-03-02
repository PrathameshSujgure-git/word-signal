import React, { useState, useCallback } from 'react';
import { useApp } from 'ink';
import { TitleScreen } from './screens/title.js';
import { GameScreen } from './screens/game.js';
import { ResultScreen } from './screens/result.js';
import { GameOverScreen } from './screens/gameover.js';
import { ScoresScreen } from './screens/scores.js';
import { getHighScore, saveScore } from './utils/storage.js';
import type { ScoreResult } from './engine/scoring.js';
import type { EncryptedMessage } from './engine/ciphers.js';

export type Screen = 'title' | 'game' | 'result' | 'gameover' | 'scores';

interface RoundResult {
  score: ScoreResult;
  level: number;
  message: EncryptedMessage;
  guess: string;
  timeRemaining: number;
  won: boolean;
}

export function App() {
  const { exit } = useApp();

  const [screen, setScreen] = useState<Screen>('title');
  const [highScore, setHighScore] = useState(() => getHighScore());
  const [level, setLevel] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [roundsPlayed, setRoundsPlayed] = useState(0);
  const [lastResult, setLastResult] = useState<RoundResult | null>(null);

  const resetGame = useCallback(() => {
    setLevel(1);
    setTotalScore(0);
    setStreak(0);
    setMaxStreak(0);
    setRoundsPlayed(0);
    setLastResult(null);
  }, []);

  const handleRoundEnd = useCallback((result: RoundResult) => {
    setLastResult(result);
    setRoundsPlayed((prev) => prev + 1);

    if (result.won) {
      setTotalScore((prev) => prev + result.score.total);
      setStreak((prev) => {
        const next = prev + 1;
        setMaxStreak((ms) => Math.max(ms, next));
        return next;
      });
    } else {
      setTotalScore((prev) => prev + result.score.total);
      setStreak(0);
    }

    setScreen('result');
  }, []);

  const handleResultContinue = useCallback(() => {
    if (!lastResult) return;

    if (lastResult.won) {
      setLevel((prev) => prev + 1);
      setScreen('game');
    } else {
      // Game over — save score
      const finalScore = totalScore + (lastResult.score.total > 0 ? 0 : 0); // already added in handleRoundEnd
      const currentHigh = getHighScore();
      const isNewHigh = totalScore > currentHigh;
      saveScore({
        score: totalScore,
        level,
        streak: maxStreak,
        date: new Date().toISOString().split('T')[0]!,
      });
      if (isNewHigh) {
        setHighScore(totalScore);
      }
      setScreen('gameover');
    }
  }, [lastResult, totalScore, level, maxStreak]);

  const handlePlayAgain = useCallback(() => {
    resetGame();
    setHighScore(getHighScore());
    setScreen('title');
  }, [resetGame]);

  if (screen === 'title') {
    return (
      <TitleScreen
        highScore={highScore}
        onPlay={() => {
          resetGame();
          setScreen('game');
        }}
        onScores={() => setScreen('scores')}
        onQuit={() => exit()}
      />
    );
  }

  if (screen === 'game') {
    return (
      <GameScreen
        key={`level-${level}-${roundsPlayed}`}
        onRoundEnd={handleRoundEnd}
        level={level}
        totalScore={totalScore}
        highScore={highScore}
        streak={streak}
      />
    );
  }

  if (screen === 'result' && lastResult) {
    return (
      <ResultScreen
        result={lastResult.score}
        won={lastResult.won}
        originalMessage={lastResult.message.original}
        guess={lastResult.guess}
        onContinue={handleResultContinue}
      />
    );
  }

  if (screen === 'gameover') {
    const currentHigh = getHighScore();
    return (
      <GameOverScreen
        totalScore={totalScore}
        highScore={currentHigh}
        isNewHigh={totalScore >= currentHigh && totalScore > 0}
        level={level}
        maxStreak={maxStreak}
        roundsPlayed={roundsPlayed}
        onPlayAgain={handlePlayAgain}
        onQuit={() => exit()}
      />
    );
  }

  if (screen === 'scores') {
    return <ScoresScreen onBack={() => setScreen('title')} />;
  }

  return null;
}
