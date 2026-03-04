export function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export interface WordScore {
  word: string;
  points: number;
  solved: boolean;
  skipped: boolean;
  hinted: boolean;
}

export interface ScoreResult {
  wordScores: WordScore[];
  wordScore: number;
  timeBonus: number;
  toolPenalty: number;
  multiplier: number;
  total: number;
  solvedCount: number;
  totalWords: number;
  allSolved: boolean;
  won: boolean;
}

/**
 * Per-word scoring: wordLength * 20 points per solved word.
 * Hinted words = 0 points. Skipped words = 0 points.
 * Time bonus = remaining * 3 (only if ALL solved).
 * Tool penalty = toolUses * 10.
 * Win = solved >= 60% of words.
 */
export function calculateScore(
  words: { original: string; solved: boolean; skipped: boolean; hinted: boolean }[],
  timeRemaining: number,
  streak: number,
  toolUses: number,
): ScoreResult {
  const wordScores: WordScore[] = words.map((w) => {
    let points = 0;
    if (w.solved && !w.hinted) {
      points = w.original.length * 20;
    }
    return {
      word: w.original,
      points,
      solved: w.solved,
      skipped: w.skipped,
      hinted: w.hinted,
    };
  });

  const wordScore = wordScores.reduce((sum, w) => sum + w.points, 0);
  const solvedCount = words.filter((w) => w.solved).length;
  const totalWords = words.length;
  const allSolved = solvedCount === totalWords;
  const timeBonus = allSolved ? Math.round(timeRemaining * 3) : 0;
  const toolPenalty = toolUses * 10;
  const multiplier = getStreakMultiplier(streak);
  const rawTotal = Math.max(0, wordScore + timeBonus - toolPenalty);
  const total = Math.round(rawTotal * multiplier);
  const won = solvedCount / totalWords >= 0.6;

  return {
    wordScores,
    wordScore,
    timeBonus,
    toolPenalty,
    multiplier,
    total,
    solvedCount,
    totalWords,
    allSolved,
    won,
  };
}
