/** Scramble the letters of a single word using Fisher-Yates shuffle. */
export function scrambleWord(word: string): string {
  if (word.length <= 2) return word; // auto-solved
  // FIX #10: words with all-identical chars can't be scrambled differently
  if (new Set(word).size === 1) return word;
  const chars = [...word];
  // Fisher-Yates shuffle
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  const result = chars.join('');
  // Re-shuffle if same as original
  if (result === word) return scrambleWord(word);
  return result;
}

export interface WordState {
  original: string;
  scrambled: string;
  /** Letters revealed by UNSCRAMBLE tool (indices in original) */
  revealedPositions: Set<number>;
  /** true = first letter revealed by FIRST LETTER tool */
  firstRevealed: boolean;
}

export interface ScrambledMessage {
  original: string;
  words: WordState[];
}

/** Scramble an entire message into per-word states. */
export function scrambleMessage(text: string): ScrambledMessage {
  const rawWords = text.split(/\s+/);
  const words: WordState[] = rawWords.map((w) => ({
    original: w,
    scrambled: w.length <= 2 ? w : scrambleWord(w),
    revealedPositions: new Set<number>(),
    firstRevealed: false,
  }));
  return { original: text, words };
}

/** Check if a word is auto-solved (too short to scramble). */
export function isAutoSolved(word: string): boolean {
  return word.length <= 2;
}

/**
 * Get the display version of a scrambled word, incorporating revealed positions.
 * Unrevealed positions show the scrambled letter; revealed positions show the original.
 */
export function getWordDisplay(state: WordState): string {
  if (isAutoSolved(state.original)) return state.original;
  const chars = [...state.scrambled];
  for (const pos of state.revealedPositions) {
    chars[pos] = state.original[pos]!;
  }
  if (state.firstRevealed && state.original.length > 0) {
    chars[0] = state.original[0]!;
  }
  return chars.join('');
}
