import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

const SIGNAL_DIR = join(homedir(), '.signal');
const SCORES_FILE = join(SIGNAL_DIR, 'scores.json');

export interface HighScore {
  score: number;
  level: number;
  streak: number;
  date: string;
}

function ensureDir(): void {
  if (!existsSync(SIGNAL_DIR)) {
    mkdirSync(SIGNAL_DIR, { recursive: true });
  }
}

export function loadScores(): HighScore[] {
  ensureDir();
  if (!existsSync(SCORES_FILE)) return [];
  try {
    return JSON.parse(readFileSync(SCORES_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export function saveScore(score: HighScore): void {
  const scores = loadScores();
  scores.push(score);
  scores.sort((a, b) => b.score - a.score);
  writeFileSync(SCORES_FILE, JSON.stringify(scores.slice(0, 10), null, 2));
}

export function getHighScore(): number {
  const scores = loadScores();
  return scores[0]?.score ?? 0;
}
