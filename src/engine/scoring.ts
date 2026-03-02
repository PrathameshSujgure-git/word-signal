export function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export function calculateAccuracy(original: string, guess: string): number {
  const len = Math.max(original.length, guess.length);
  if (len === 0) return 1;
  let matches = 0;
  for (let i = 0; i < len; i++) {
    if (original[i] === guess[i]) matches++;
  }
  return matches / len;
}

export interface ScoreResult {
  wordScore: number;
  timeBonus: number;
  multiplier: number;
  total: number;
  accuracy: number;
  perfect: boolean;
}

export function calculateScore(
  original: string,
  guess: string,
  timeRemaining: number,
  streak: number
): ScoreResult {
  const words = original.split(/\s+/).length;
  const accuracy = calculateAccuracy(original, guess);
  const perfect = original === guess;
  const wordScore = perfect ? words * 100 : Math.round(words * 100 * accuracy);
  const timeBonus = perfect ? Math.round(timeRemaining * 2) : 0;
  const multiplier = getStreakMultiplier(streak);
  const total = Math.round((wordScore + timeBonus) * multiplier);

  return { wordScore, timeBonus, multiplier, total, accuracy, perfect };
}
