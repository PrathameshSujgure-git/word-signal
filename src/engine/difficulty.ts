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
 * Easier difficulty curve — more time, fewer words, more tools.
 *
 * Time:  starts at 75s, -2s per level, floor at 30s
 * Words: increases slowly
 * Tools: generous early, taper gradually
 */
export function getLevelConfig(level: number): LevelConfig {
  // Time: 75s at lvl 1, lose 2s per level, floor at 30s
  const timeLimit = Math.max(30, 75 - (level - 1) * 2);

  // Levels 1-4: Tutorial — short words, lots of help
  if (level <= 4) {
    return {
      level, timeLimit,
      minWords: 3, maxWords: 4,
      maxWordLength: 5,
      hintUses: 2, unscrambleUses: 4, firstLetterUses: 2, skipUses: 2,
    };
  }
  // Levels 5-8: Easy — slightly longer phrases
  if (level <= 8) {
    return {
      level, timeLimit,
      minWords: 3, maxWords: 5,
      maxWordLength: 6,
      hintUses: 2, unscrambleUses: 3, firstLetterUses: 2, skipUses: 1,
    };
  }
  // Levels 9-12: Medium — word length starts opening up
  if (level <= 12) {
    return {
      level, timeLimit,
      minWords: 3, maxWords: 5,
      maxWordLength: 7,
      hintUses: 1, unscrambleUses: 2, firstLetterUses: 1, skipUses: 1,
    };
  }
  // Levels 13-16: Medium+ — any word length
  if (level <= 16) {
    return {
      level, timeLimit,
      minWords: 4, maxWords: 6,
      maxWordLength: 0,
      hintUses: 1, unscrambleUses: 2, firstLetterUses: 1, skipUses: 1,
    };
  }
  // Levels 17-20: Hard — more words, fewer tools
  if (level <= 20) {
    return {
      level, timeLimit,
      minWords: 4, maxWords: 7,
      maxWordLength: 0,
      hintUses: 1, unscrambleUses: 1, firstLetterUses: 1, skipUses: 0,
    };
  }
  // Levels 21-24: Very hard
  if (level <= 24) {
    return {
      level, timeLimit,
      minWords: 5, maxWords: 8,
      maxWordLength: 0,
      hintUses: 0, unscrambleUses: 1, firstLetterUses: 1, skipUses: 0,
    };
  }
  // Levels 25+: Insane — endgame
  return {
    level, timeLimit,
    minWords: 5, maxWords: 9,
    maxWordLength: 0,
    hintUses: 0, unscrambleUses: 1, firstLetterUses: 0, skipUses: 0,
  };
}
