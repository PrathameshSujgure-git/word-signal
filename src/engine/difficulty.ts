import type { CipherType } from "./ciphers.js";

export interface LevelConfig {
  level: number;
  cipherType: CipherType;
  timeLimit: number;
  freqScanUses: number;
  patternUses: number;
  substituteUses: number;
  hintUses: number;
}

export function getLevelConfig(level: number): LevelConfig {
  if (level <= 3) {
    return {
      level,
      cipherType: "caesar",
      timeLimit: 60,
      freqScanUses: 3,
      patternUses: 3,
      substituteUses: 5,
      hintUses: 1,
    };
  }
  if (level <= 6) {
    return {
      level,
      cipherType: "substitution",
      timeLimit: 60,
      freqScanUses: 3,
      patternUses: 3,
      substituteUses: 5,
      hintUses: 1,
    };
  }
  if (level <= 9) {
    return {
      level,
      cipherType: "vigenere",
      timeLimit: 60,
      freqScanUses: 2,
      patternUses: 2,
      substituteUses: 4,
      hintUses: 1,
    };
  }
  return {
    level,
    cipherType: "vigenere",
    timeLimit: 45,
    freqScanUses: 2,
    patternUses: 2,
    substituteUses: 3,
    hintUses: 0,
  };
}
