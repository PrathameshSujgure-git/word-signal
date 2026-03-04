export interface LevelConfig {
  level: number;
  timeLimit: number;
  /** Number of words in the message */
  minWords: number;
  maxWords: number;
  /** Max word length filter (0 = any) */
  maxWordLength: number;
  /** Tool use counts */
  hintUses: number;
  unscrambleUses: number;
  firstLetterUses: number;
  skipUses: number;
}

/**
 * Gentler difficulty curve — ramps up over ~20 levels instead of 10.
 *
 * Time:  -2s per level (was -3s), floor at 25s (was 15s)
 * Words: increases by +1 every 3-4 levels
 * Tools: taper off gradually, never fully gone until very late
 */
export function getLevelConfig(level: number): LevelConfig {
  // Time: 60s at lvl 1, lose 2s per level, floor at 25s
  const timeLimit = Math.max(25, 60 - (level - 1) * 2);

  // Levels 1-3: Tutorial — short words, lots of help
  if (level <= 3) {
    return {
      level, timeLimit,
      minWords: 3, maxWords: 4,
      maxWordLength: 6,
      hintUses: 2, unscrambleUses: 3, firstLetterUses: 2, skipUses: 2,
    };
  }
  // Levels 4-6: Easy — slightly longer phrases
  if (level <= 6) {
    return {
      level, timeLimit,
      minWords: 3, maxWords: 5,
      maxWordLength: 7,
      hintUses: 2, unscrambleUses: 2, firstLetterUses: 2, skipUses: 1,
    };
  }
  // Levels 7-9: Medium — word length unrestricted
  if (level <= 9) {
    return {
      level, timeLimit,
      minWords: 4, maxWords: 6,
      maxWordLength: 0,
      hintUses: 1, unscrambleUses: 2, firstLetterUses: 1, skipUses: 1,
    };
  }
  // Levels 10-12: Medium+ — more words
  if (level <= 12) {
    return {
      level, timeLimit,
      minWords: 4, maxWords: 7,
      maxWordLength: 0,
      hintUses: 1, unscrambleUses: 1, firstLetterUses: 1, skipUses: 1,
    };
  }
  // Levels 13-15: Hard — longer phrases, fewer tools
  if (level <= 15) {
    return {
      level, timeLimit,
      minWords: 5, maxWords: 8,
      maxWordLength: 0,
      hintUses: 1, unscrambleUses: 1, firstLetterUses: 1, skipUses: 0,
    };
  }
  // Levels 16-18: Very hard
  if (level <= 18) {
    return {
      level, timeLimit,
      minWords: 5, maxWords: 9,
      maxWordLength: 0,
      hintUses: 0, unscrambleUses: 1, firstLetterUses: 0, skipUses: 0,
    };
  }
  // Levels 19+: Insane — endgame
  return {
    level, timeLimit,
    minWords: 6, maxWords: 10,
    maxWordLength: 0,
    hintUses: 0, unscrambleUses: 1, firstLetterUses: 0, skipUses: 0,
  };
}
