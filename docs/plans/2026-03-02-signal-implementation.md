# Signal Game Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a cyberpunk code-breaking terminal game runnable via `npx signal-decode`.

**Architecture:** Ink (React for terminal) renders a cyberpunk HUD. A cipher engine generates encrypted messages. Game state is managed via React hooks. Scores persist to `~/.signal/scores.json`.

**Tech Stack:** TypeScript, Ink 6, chalk, ink-big-text, ink-gradient, figlet

---

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `src/index.tsx`
- Create: `src/app.tsx`
- Create: `src/theme.ts`

**Step 1: Initialize project**

```bash
cd ~/Desktop/code/claude/signal-game
npm init -y
```

**Step 2: Install dependencies**

```bash
npm install ink react ink-big-text ink-gradient chalk figlet
npm install -D typescript @types/react @types/figlet tsx @tsconfig/node-lts
```

**Step 3: Create tsconfig.json**

```json
{
  "extends": "@tsconfig/node-lts/tsconfig.json",
  "compilerOptions": {
    "jsx": "react-jsx",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "module": "nodenext",
    "moduleResolution": "nodenext"
  },
  "include": ["src"]
}
```

**Step 4: Create package.json bin entry**

Update `package.json`:
```json
{
  "name": "signal-decode",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "signal": "./dist/index.js"
  },
  "scripts": {
    "dev": "tsx src/index.tsx",
    "build": "tsc",
    "test": "node --test"
  }
}
```

**Step 5: Create theme.ts**

```typescript
// src/theme.ts
export const colors = {
  primary: '#00FFFF',    // cyan
  accent: '#FF00FF',     // magenta
  warning: '#FFD700',    // yellow
  danger: '#FF4444',     // red
  success: '#00FF88',    // green
  muted: '#555555',      // dim gray
  bg: '#000000',         // black
  text: '#CCCCCC',       // light gray
  bright: '#FFFFFF',     // white
} as const;

export const borders = {
  double: { topLeft: '╔', topRight: '╗', bottomLeft: '╚', bottomRight: '╝', horizontal: '═', vertical: '║', teeLeft: '╠', teeRight: '╣' },
  single: { topLeft: '┌', topRight: '┐', bottomLeft: '└', bottomRight: '┘', horizontal: '─', vertical: '│' },
} as const;
```

**Step 6: Create entry point src/index.tsx**

```tsx
#!/usr/bin/env node
import { render } from 'ink';
import React from 'react';
import { App } from './app.js';

render(React.createElement(App));
```

**Step 7: Create src/app.tsx with placeholder**

```tsx
import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { colors } from './theme.js';

export type Screen = 'title' | 'game' | 'result' | 'gameover';

export function App() {
  const [screen, setScreen] = useState<Screen>('title');
  return (
    <Box flexDirection="column">
      <Text color={colors.primary}>SIGNAL — Loading...</Text>
    </Box>
  );
}
```

**Step 8: Verify it runs**

Run: `npm run dev`
Expected: See "SIGNAL — Loading..." in cyan

**Step 9: Commit**

```bash
git init
echo "node_modules/\ndist/" > .gitignore
git add .
git commit -m "feat: scaffold signal-decode project with ink + typescript"
```

---

### Task 2: Cipher Engine

**Files:**
- Create: `src/engine/ciphers.ts`
- Create: `src/engine/ciphers.test.ts`

**Step 1: Write failing tests for Caesar cipher**

```typescript
// src/engine/ciphers.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { caesarEncrypt, caesarDecrypt, substitutionEncrypt, substitutionDecrypt, vigenereEncrypt, vigenereDecrypt } from './ciphers.js';

describe('Caesar cipher', () => {
  it('encrypts with shift 3', () => {
    assert.strictEqual(caesarEncrypt('hello', 3), 'khoor');
  });
  it('handles uppercase', () => {
    assert.strictEqual(caesarEncrypt('Hello World', 3), 'Khoor Zruog');
  });
  it('preserves spaces and punctuation', () => {
    assert.strictEqual(caesarEncrypt('hi there!', 1), 'ij uifsf!');
  });
  it('decrypts correctly', () => {
    assert.strictEqual(caesarDecrypt('khoor', 3), 'hello');
  });
  it('wraps around z', () => {
    assert.strictEqual(caesarEncrypt('xyz', 3), 'abc');
  });
});

describe('Substitution cipher', () => {
  it('encrypts and decrypts roundtrip', () => {
    const key = 'zyxwvutsrqponmlkjihgfedcba'; // atbash
    const plain = 'hello world';
    const encrypted = substitutionEncrypt(plain, key);
    assert.strictEqual(substitutionDecrypt(encrypted, key), plain);
  });
  it('preserves non-alpha characters', () => {
    const key = 'zyxwvutsrqponmlkjihgfedcba';
    assert.strictEqual(substitutionEncrypt('hi!', key), 'sr!');
  });
});

describe('Vigenere cipher', () => {
  it('encrypts correctly', () => {
    assert.strictEqual(vigenereEncrypt('hello', 'key'), 'rijvs');
  });
  it('decrypts correctly', () => {
    assert.strictEqual(vigenereDecrypt('rijvs', 'key'), 'hello');
  });
  it('preserves spaces', () => {
    assert.strictEqual(vigenereEncrypt('hello world', 'key'), 'rijvs uyvjn');
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx tsx --test src/engine/ciphers.test.ts`
Expected: FAIL — module not found

**Step 3: Implement ciphers**

```typescript
// src/engine/ciphers.ts
function shiftChar(c: string, shift: number): string {
  if (/[a-z]/.test(c)) {
    return String.fromCharCode(((c.charCodeAt(0) - 97 + shift + 26) % 26) + 97);
  }
  if (/[A-Z]/.test(c)) {
    return String.fromCharCode(((c.charCodeAt(0) - 65 + shift + 26) % 26) + 65);
  }
  return c;
}

export function caesarEncrypt(text: string, shift: number): string {
  return [...text].map(c => shiftChar(c, shift)).join('');
}

export function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, -shift);
}

export function substitutionEncrypt(text: string, key: string): string {
  return [...text].map(c => {
    if (/[a-z]/.test(c)) return key[c.charCodeAt(0) - 97];
    if (/[A-Z]/.test(c)) return key[c.charCodeAt(0) - 65].toUpperCase();
    return c;
  }).join('');
}

export function substitutionDecrypt(text: string, key: string): string {
  const reverseKey = Array(26).fill('');
  for (let i = 0; i < 26; i++) {
    reverseKey[key.charCodeAt(i) - 97] = String.fromCharCode(97 + i);
  }
  return [...text].map(c => {
    if (/[a-z]/.test(c)) return reverseKey[c.charCodeAt(0) - 97];
    if (/[A-Z]/.test(c)) return reverseKey[c.charCodeAt(0) - 65].toUpperCase();
    return c;
  }).join('');
}

export function vigenereEncrypt(text: string, key: string): string {
  let ki = 0;
  return [...text].map(c => {
    if (/[a-zA-Z]/.test(c)) {
      const shift = key.charCodeAt(ki % key.length) - 97;
      ki++;
      return shiftChar(c, shift);
    }
    return c;
  }).join('');
}

export function vigenereDecrypt(text: string, key: string): string {
  let ki = 0;
  return [...text].map(c => {
    if (/[a-zA-Z]/.test(c)) {
      const shift = key.charCodeAt(ki % key.length) - 97;
      ki++;
      return shiftChar(c, -shift);
    }
    return c;
  }).join('');
}

export type CipherType = 'caesar' | 'substitution' | 'vigenere';

export interface EncryptedMessage {
  original: string;
  encrypted: string;
  cipherType: CipherType;
  key: number | string;
}

export function generateSubstitutionKey(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
  for (let i = alphabet.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [alphabet[i], alphabet[j]] = [alphabet[j], alphabet[i]];
  }
  return alphabet.join('');
}

export function generateVigenereKey(): string {
  const length = 3 + Math.floor(Math.random() * 4); // 3-6 chars
  return Array.from({ length }, () =>
    String.fromCharCode(97 + Math.floor(Math.random() * 26))
  ).join('');
}

export function encryptMessage(text: string, cipherType: CipherType): EncryptedMessage {
  switch (cipherType) {
    case 'caesar': {
      const shift = 1 + Math.floor(Math.random() * 5);
      return { original: text, encrypted: caesarEncrypt(text, shift), cipherType, key: shift };
    }
    case 'substitution': {
      const key = generateSubstitutionKey();
      return { original: text, encrypted: substitutionEncrypt(text, key), cipherType, key };
    }
    case 'vigenere': {
      const key = generateVigenereKey();
      return { original: text, encrypted: vigenereEncrypt(text, key), cipherType, key };
    }
  }
}
```

**Step 4: Run tests to verify they pass**

Run: `npx tsx --test src/engine/ciphers.test.ts`
Expected: All 8 tests PASS

**Step 5: Commit**

```bash
git add src/engine/
git commit -m "feat: implement caesar, substitution, and vigenere cipher engine with tests"
```

---

### Task 3: Messages, Scoring, and Difficulty

**Files:**
- Create: `src/engine/messages.ts`
- Create: `src/engine/scoring.ts`
- Create: `src/engine/scoring.test.ts`
- Create: `src/engine/difficulty.ts`

**Step 1: Create message pool**

```typescript
// src/engine/messages.ts
export const messages: string[] = [
  "the quick brown fox jumps over the lazy dog",
  "fortune favors the bold",
  "knowledge is power",
  "the future belongs to the curious",
  "not all who wander are lost",
  "the only limit is your imagination",
  "hack the planet",
  "trust no one",
  "the truth is out there",
  "we are all made of stars",
  "break the code save the world",
  "information wants to be free",
  "in the beginning was the command line",
  "the net is vast and infinite",
  "reality is merely an illusion",
  "do or do not there is no try",
  "the cake is a lie",
  "all your base are belong to us",
  "never gonna give you up",
  "wake up neo",
  "follow the white rabbit",
  "i know kung fu",
  "there is no spoon",
  "the matrix has you",
  "resistance is futile",
  "live long and prosper",
  "these are not the droids you are looking for",
  "may the force be with you",
  "i am become death destroyer of worlds",
  "to infinity and beyond",
  "with great power comes great responsibility",
  "the spice must flow",
  "winter is coming",
  "all that glitters is not gold",
  "time is the fire in which we burn",
  "the enemy gate is down",
  "dont panic",
  "so it goes",
  "the universe is under no obligation to make sense",
  "any sufficiently advanced technology is indistinguishable from magic",
  "we choose to go to the moon",
  "one small step for man one giant leap for mankind",
  "the cosmos is within us",
  "somewhere something incredible is waiting to be known",
  "per aspera ad astra",
  "cogito ergo sum",
  "memento mori",
  "carpe diem",
  "alea iacta est",
  "veni vidi vici",
];

export function getRandomMessage(): string {
  return messages[Math.floor(Math.random() * messages.length)];
}
```

**Step 2: Write scoring tests**

```typescript
// src/engine/scoring.test.ts
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { calculateScore, getStreakMultiplier, calculateAccuracy } from './scoring.js';

describe('Scoring', () => {
  it('gives 100 points per correct word', () => {
    const score = calculateScore('hello world', 'hello world', 30, 0);
    assert.strictEqual(score.wordScore, 200);
  });
  it('adds time bonus', () => {
    const score = calculateScore('hello', 'hello', 30, 0);
    assert.strictEqual(score.timeBonus, 60); // 30 * 2
  });
  it('applies streak multiplier at streak 3', () => {
    assert.strictEqual(getStreakMultiplier(3), 1.5);
  });
  it('applies streak multiplier at streak 5', () => {
    assert.strictEqual(getStreakMultiplier(5), 2);
  });
  it('applies streak multiplier at streak 10', () => {
    assert.strictEqual(getStreakMultiplier(10), 3);
  });
  it('calculates partial accuracy', () => {
    const acc = calculateAccuracy('hello world', 'hello xxxxx');
    assert.ok(acc > 0.4 && acc < 0.6);
  });
});
```

**Step 3: Implement scoring**

```typescript
// src/engine/scoring.ts
export function getStreakMultiplier(streak: number): number {
  if (streak >= 10) return 3;
  if (streak >= 5) return 2;
  if (streak >= 3) return 1.5;
  return 1;
}

export function calculateAccuracy(original: string, guess: string): number {
  const origLower = original.toLowerCase();
  const guessLower = guess.toLowerCase();
  let correct = 0;
  const maxLen = Math.max(origLower.length, guessLower.length);
  if (maxLen === 0) return 1;
  for (let i = 0; i < maxLen; i++) {
    if (origLower[i] === guessLower[i]) correct++;
  }
  return correct / maxLen;
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
  streak: number,
): ScoreResult {
  const origWords = original.toLowerCase().split(/\s+/);
  const guessWords = guess.toLowerCase().split(/\s+/);

  let correctWords = 0;
  for (let i = 0; i < origWords.length; i++) {
    if (guessWords[i] === origWords[i]) correctWords++;
  }

  const wordScore = correctWords * 100;
  const timeBonus = timeRemaining * 2;
  const accuracy = calculateAccuracy(original, guess);
  const perfect = accuracy === 1;
  const multiplier = getStreakMultiplier(streak);
  const total = Math.round((wordScore + timeBonus) * multiplier);

  return { wordScore, timeBonus, multiplier, total, accuracy, perfect };
}
```

**Step 4: Create difficulty module**

```typescript
// src/engine/difficulty.ts
import { type CipherType } from './ciphers.js';

export interface LevelConfig {
  level: number;
  cipherType: CipherType;
  timeLimit: number; // seconds
  freqScanUses: number;
  patternUses: number;
  substituteUses: number;
  hintUses: number;
}

export function getLevelConfig(level: number): LevelConfig {
  if (level <= 3) {
    return {
      level,
      cipherType: 'caesar',
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
      cipherType: 'substitution',
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
      cipherType: 'vigenere',
      timeLimit: 60,
      freqScanUses: 2,
      patternUses: 2,
      substituteUses: 4,
      hintUses: 1,
    };
  }
  // Level 10+: harder vigenere, fewer tools
  return {
    level,
    cipherType: 'vigenere',
    timeLimit: 45,
    freqScanUses: 2,
    patternUses: 2,
    substituteUses: 3,
    hintUses: 0,
  };
}
```

**Step 5: Run scoring tests**

Run: `npx tsx --test src/engine/scoring.test.ts`
Expected: All 6 tests PASS

**Step 6: Commit**

```bash
git add src/engine/
git commit -m "feat: add messages pool, scoring system, and difficulty progression"
```

---

### Task 4: Score Storage

**Files:**
- Create: `src/utils/storage.ts`

**Step 1: Implement local storage**

```typescript
// src/utils/storage.ts
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

function ensureDir() {
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
  const top10 = scores.slice(0, 10);
  writeFileSync(SCORES_FILE, JSON.stringify(top10, null, 2));
}

export function getHighScore(): number {
  const scores = loadScores();
  return scores[0]?.score ?? 0;
}
```

**Step 2: Commit**

```bash
git add src/utils/
git commit -m "feat: add local high score persistence to ~/.signal/"
```

---

### Task 5: Title Screen

**Files:**
- Create: `src/screens/title.tsx`
- Modify: `src/app.tsx`

**Step 1: Build title screen with ASCII art and menu**

```tsx
// src/screens/title.tsx
import React, { useState } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';

interface TitleScreenProps {
  highScore: number;
  onPlay: () => void;
  onScores: () => void;
  onQuit: () => void;
}

const LOGO = `
 ███████╗██╗ ██████╗ ███╗   ██╗ █████╗ ██╗
 ██╔════╝██║██╔════╝ ████╗  ██║██╔══██╗██║
 ███████╗██║██║  ███╗██╔██╗ ██║███████║██║
 ╚════██║██║██║   ██║██║╚██╗██║██╔══██║██║
 ███████║██║╚██████╔╝██║ ╚████║██║  ██║███████╗
 ╚══════╝╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝`;

const SCANLINE = '▓'.repeat(50);

const menuItems = ['INTERCEPT', 'HIGH SCORES', 'QUIT'] as const;

export function TitleScreen({ highScore, onPlay, onScores, onQuit }: TitleScreenProps) {
  const [selected, setSelected] = useState(0);

  useInput((input, key) => {
    if (key.upArrow) setSelected(s => (s - 1 + menuItems.length) % menuItems.length);
    if (key.downArrow) setSelected(s => (s + 1) % menuItems.length);
    if (key.return) {
      if (selected === 0) onPlay();
      if (selected === 1) onScores();
      if (selected === 2) onQuit();
    }
    if (input === 'q') onQuit();
  });

  return (
    <Box flexDirection="column" alignItems="center" paddingX={2}>
      <Text color={colors.muted}>{SCANLINE}</Text>
      <Text color={colors.primary}>{LOGO}</Text>
      <Text color={colors.muted}>{SCANLINE}</Text>
      <Box marginTop={1}>
        <Text color={colors.accent} dimColor>{'░░▒▒▓▓ '}</Text>
        <Text color={colors.accent}>SIGNAL INTERCEPT SYSTEM v1.0</Text>
        <Text color={colors.accent} dimColor>{' ▓▓▒▒░░'}</Text>
      </Box>
      <Box flexDirection="column" marginTop={1} alignItems="center">
        {menuItems.map((item, i) => (
          <Text key={item} color={i === selected ? colors.primary : colors.muted}>
            {i === selected ? '▸ ' : '  '}{item}{i === selected ? ' ◂' : ''}
          </Text>
        ))}
      </Box>
      {highScore > 0 && (
        <Box marginTop={1}>
          <Text color={colors.muted}>HIGH SCORE: </Text>
          <Text color={colors.warning}>{highScore.toLocaleString()}</Text>
        </Box>
      )}
      <Box marginTop={1}>
        <Text color={colors.muted} dimColor>↑↓ navigate • enter select • q quit</Text>
      </Box>
    </Box>
  );
}
```

**Step 2: Update app.tsx to use title screen**

```tsx
// src/app.tsx
import React, { useState, useCallback } from 'react';
import { Box, useApp } from 'ink';
import { TitleScreen } from './screens/title.js';
import { getHighScore } from './utils/storage.js';

export type Screen = 'title' | 'game' | 'result' | 'gameover' | 'scores';

export function App() {
  const { exit } = useApp();
  const [screen, setScreen] = useState<Screen>('title');
  const [highScore] = useState(() => getHighScore());

  const handleQuit = useCallback(() => exit(), [exit]);

  return (
    <Box flexDirection="column">
      {screen === 'title' && (
        <TitleScreen
          highScore={highScore}
          onPlay={() => setScreen('game')}
          onScores={() => setScreen('scores')}
          onQuit={handleQuit}
        />
      )}
    </Box>
  );
}
```

**Step 3: Run and verify title screen**

Run: `npm run dev`
Expected: Cyberpunk title screen with SIGNAL ASCII art, menu navigation works

**Step 4: Commit**

```bash
git add src/
git commit -m "feat: add cyberpunk title screen with ASCII logo and menu"
```

---

### Task 6: HUD Frame Component

**Files:**
- Create: `src/components/hud.tsx`

**Step 1: Build the HUD border/frame**

```tsx
// src/components/hud.tsx
import React from 'react';
import { Box, Text } from 'ink';
import { colors, borders } from '../theme.js';

interface HUDProps {
  children: React.ReactNode;
  width?: number;
}

export function HUD({ children, width = 50 }: HUDProps) {
  const b = borders.double;
  const inner = width - 2;

  return (
    <Box flexDirection="column">
      <Text color={colors.primary}>
        {b.topLeft}{b.horizontal.repeat(inner)}{b.topRight}
      </Text>
      {children}
      <Text color={colors.primary}>
        {b.bottomLeft}{b.horizontal.repeat(inner)}{b.bottomRight}
      </Text>
    </Box>
  );
}

interface HUDRowProps {
  children: React.ReactNode;
  width?: number;
}

export function HUDRow({ children, width = 50 }: HUDRowProps) {
  return (
    <Box>
      <Text color={colors.primary}>║ </Text>
      <Box width={width - 4}>{children}</Box>
      <Text color={colors.primary}> ║</Text>
    </Box>
  );
}

export function HUDDivider({ width = 50 }: { width?: number }) {
  const b = borders.double;
  const inner = width - 2;
  return (
    <Text color={colors.primary}>
      {b.teeLeft}{b.horizontal.repeat(inner)}{b.teeRight}
    </Text>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/
git commit -m "feat: add HUD frame component with cyberpunk double-border styling"
```

---

### Task 7: Timer Component

**Files:**
- Create: `src/components/timer.tsx`

**Step 1: Build countdown timer with color transitions**

```tsx
// src/components/timer.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface TimerProps {
  duration: number; // total seconds
  onExpire: () => void;
  paused?: boolean;
  onTick?: (remaining: number) => void;
}

export function Timer({ duration, onExpire, paused = false, onTick }: TimerProps) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    if (paused) return;
    if (remaining <= 0) {
      onExpire();
      return;
    }
    const timer = setInterval(() => {
      setRemaining(r => {
        const next = r - 1;
        onTick?.(next);
        if (next <= 0) {
          clearInterval(timer);
          onExpire();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [remaining <= 0, paused]);

  const ratio = remaining / duration;
  const barWidth = 30;
  const filled = Math.round(ratio * barWidth);
  const empty = barWidth - filled;

  let barColor = colors.success;
  if (ratio < 0.25) barColor = colors.danger;
  else if (ratio < 0.5) barColor = colors.warning;

  return (
    <Box>
      <Text color={colors.muted}>⏱ </Text>
      <Text color={barColor}>{'█'.repeat(filled)}</Text>
      <Text color={colors.muted}>{'░'.repeat(empty)}</Text>
      <Text color={barColor}> {remaining}s</Text>
    </Box>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/timer.tsx
git commit -m "feat: add timer component with green/yellow/red color transitions"
```

---

### Task 8: Tools Panel Component

**Files:**
- Create: `src/components/tools.tsx`

**Step 1: Build tool panel with usage bars**

```tsx
// src/components/tools.tsx
import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

export interface ToolState {
  name: string;
  key: string;
  maxUses: number;
  usesLeft: number;
}

interface ToolsPanelProps {
  tools: ToolState[];
  activeTool: string | null;
}

export function ToolsPanel({ tools, activeTool }: ToolsPanelProps) {
  return (
    <Box flexDirection="column">
      {tools.map(tool => {
        const isActive = activeTool === tool.key;
        const barFilled = tool.usesLeft;
        const barEmpty = tool.maxUses - tool.usesLeft;
        const isExhausted = tool.usesLeft === 0;

        return (
          <Box key={tool.key}>
            <Text color={isActive ? colors.primary : isExhausted ? colors.muted : colors.text}>
              {isActive ? '▸' : ' '} [{tool.key}] {tool.name.padEnd(12)}
            </Text>
            <Text color={isExhausted ? colors.muted : colors.primary}>
              {'█'.repeat(barFilled)}
            </Text>
            <Text color={colors.muted}>
              {'░'.repeat(barEmpty)}
            </Text>
            <Text color={isExhausted ? colors.muted : colors.text}>
              {' '}{tool.usesLeft}/{tool.maxUses}
            </Text>
          </Box>
        );
      })}
    </Box>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/tools.tsx
git commit -m "feat: add tools panel component with usage bars"
```

---

### Task 9: Frequency Chart & Transmission Display

**Files:**
- Create: `src/components/freq-chart.tsx`
- Create: `src/components/transmission.tsx`

**Step 1: Build frequency analysis chart**

```tsx
// src/components/freq-chart.tsx
import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface FreqChartProps {
  text: string;
}

export function FreqChart({ text }: FreqChartProps) {
  const freq: Record<string, number> = {};
  let maxFreq = 0;
  for (const c of text.toLowerCase()) {
    if (/[a-z]/.test(c)) {
      freq[c] = (freq[c] || 0) + 1;
      if (freq[c] > maxFreq) maxFreq = freq[c];
    }
  }

  const barMax = 15;
  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]).slice(0, 10);

  return (
    <Box flexDirection="column">
      <Text color={colors.accent}>{'░░▒▒ FREQUENCY ANALYSIS ▒▒░░'}</Text>
      {sorted.map(([letter, count]) => {
        const barLen = Math.round((count / maxFreq) * barMax);
        return (
          <Box key={letter}>
            <Text color={colors.primary}>{letter.toUpperCase()} </Text>
            <Text color={colors.accent}>{'█'.repeat(barLen)}</Text>
            <Text color={colors.muted}> {count}</Text>
          </Box>
        );
      })}
    </Box>
  );
}
```

**Step 2: Build transmission display**

```tsx
// src/components/transmission.tsx
import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';

interface TransmissionProps {
  encrypted: string;
  substitutions: Map<string, string>;
  revealedWords: Set<number>;
  originalWords: string[];
}

export function Transmission({ encrypted, substitutions, revealedWords, originalWords }: TransmissionProps) {
  // Apply substitutions to show current decoding progress
  let display = encrypted;
  for (const [from, to] of substitutions) {
    display = display.replaceAll(from, to.toUpperCase());
  }

  // Show revealed words
  const words = display.split(' ');
  const displayWords = words.map((word, i) => {
    if (revealedWords.has(i)) {
      return originalWords[i]?.toUpperCase() ?? word;
    }
    return word;
  });

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={colors.accent} dimColor>{'░░▒▒▓▓ '}</Text>
        <Text color={colors.accent}>INTERCEPTED TRANSMISSION</Text>
        <Text color={colors.accent} dimColor>{' ▓▓▒▒░░'}</Text>
      </Box>
      <Box marginTop={1}>
        <Text color={colors.bright}> {displayWords.join(' ')}</Text>
      </Box>
    </Box>
  );
}
```

**Step 3: Commit**

```bash
git add src/components/
git commit -m "feat: add frequency chart and transmission display components"
```

---

### Task 10: Main Game Screen

**Files:**
- Create: `src/screens/game.tsx`
- Create: `src/components/scorebar.tsx`
- Modify: `src/app.tsx`

**Step 1: Build scorebar**

```tsx
// src/components/scorebar.tsx
import React from 'react';
import { Box, Text } from 'ink';
import { colors } from '../theme.js';
import { getStreakMultiplier } from '../engine/scoring.js';

interface ScoreBarProps {
  level: number;
  score: number;
  highScore: number;
  streak: number;
}

export function ScoreBar({ level, score, highScore, streak }: ScoreBarProps) {
  const mult = getStreakMultiplier(streak);
  return (
    <Box justifyContent="space-between">
      <Text color={colors.muted}>
        LVL:<Text color={colors.primary}>{level}</Text>
        {'  '}SCORE:<Text color={colors.warning}>{score.toLocaleString()}</Text>
        {'  '}HIGH:<Text color={colors.muted}>{highScore.toLocaleString()}</Text>
        {'  '}STREAK:<Text color={streak >= 3 ? colors.accent : colors.text}>{streak}</Text>
        {mult > 1 && <Text color={colors.accent}> x{mult}</Text>}
      </Text>
    </Box>
  );
}
```

**Step 2: Build main game screen**

This is the core game loop. It manages:
- Cipher generation for current level
- Tool usage and state
- Timer
- Player input
- Substitution tracking
- Frequency analysis overlay toggle

```tsx
// src/screens/game.tsx
import React, { useState, useCallback, useMemo } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import { HUD, HUDRow, HUDDivider } from '../components/hud.js';
import { Transmission } from '../components/transmission.js';
import { ToolsPanel, type ToolState } from '../components/tools.js';
import { Timer } from '../components/timer.js';
import { FreqChart } from '../components/freq-chart.js';
import { ScoreBar } from '../components/scorebar.js';
import { encryptMessage, type EncryptedMessage } from '../engine/ciphers.js';
import { getLevelConfig, type LevelConfig } from '../engine/difficulty.js';
import { getRandomMessage } from '../engine/messages.js';
import { calculateScore, type ScoreResult } from '../engine/scoring.js';

interface GameScreenProps {
  onRoundEnd: (result: {
    score: ScoreResult;
    level: number;
    message: EncryptedMessage;
    guess: string;
    timeRemaining: number;
    won: boolean;
  }) => void;
  level: number;
  totalScore: number;
  highScore: number;
  streak: number;
}

type GamePhase = 'playing' | 'substituting' | 'freq' | 'pattern';

export function GameScreen({ onRoundEnd, level, totalScore, highScore, streak }: GameScreenProps) {
  const config = useMemo(() => getLevelConfig(level), [level]);
  const message = useMemo(() => {
    const text = getRandomMessage();
    return encryptMessage(text, config.cipherType);
  }, [level]);

  const [input, setInput] = useState('');
  const [phase, setPhase] = useState<GamePhase>('playing');
  const [subFrom, setSubFrom] = useState('');
  const [substitutions, setSubstitutions] = useState<Map<string, string>>(new Map());
  const [revealedWords, setRevealedWords] = useState<Set<number>>(new Set());
  const [timeRemaining, setTimeRemaining] = useState(config.timeLimit);
  const [tools, setTools] = useState<ToolState[]>([
    { name: 'FREQ SCAN', key: '1', maxUses: config.freqScanUses, usesLeft: config.freqScanUses },
    { name: 'PATTERN', key: '2', maxUses: config.patternUses, usesLeft: config.patternUses },
    { name: 'SUBSTITUTE', key: '3', maxUses: config.substituteUses, usesLeft: config.substituteUses },
    { name: 'HINT', key: '4', maxUses: config.hintUses, usesLeft: config.hintUses },
  ]);

  const useTool = useCallback((key: string) => {
    setTools(prev => prev.map(t =>
      t.key === key && t.usesLeft > 0 ? { ...t, usesLeft: t.usesLeft - 1 } : t
    ));
  }, []);

  const handleSubmit = useCallback(() => {
    const result = calculateScore(message.original, input, timeRemaining, streak);
    onRoundEnd({
      score: result,
      level,
      message,
      guess: input,
      timeRemaining,
      won: result.accuracy > 0.8,
    });
  }, [input, message, timeRemaining, streak, level]);

  const handleExpire = useCallback(() => {
    const result = calculateScore(message.original, input, 0, streak);
    onRoundEnd({
      score: result,
      level,
      message,
      guess: input,
      timeRemaining: 0,
      won: false,
    });
  }, [input, message, streak, level]);

  useInput((ch, key) => {
    if (phase === 'substituting') {
      if (key.escape) {
        setPhase('playing');
        setSubFrom('');
        return;
      }
      if (/^[a-z]$/i.test(ch)) {
        if (!subFrom) {
          setSubFrom(ch.toLowerCase());
        } else {
          setSubstitutions(prev => new Map(prev).set(subFrom, ch.toLowerCase()));
          useTool('3');
          setSubFrom('');
          setPhase('playing');
        }
      }
      return;
    }

    if (phase === 'freq' || phase === 'pattern') {
      if (key.escape || ch) {
        setPhase('playing');
      }
      return;
    }

    // Playing phase
    if (ch === '1' && tools[0].usesLeft > 0 && input === '') {
      useTool('1');
      setPhase('freq');
      return;
    }
    if (ch === '2' && tools[1].usesLeft > 0 && input === '') {
      useTool('2');
      setPhase('pattern');
      return;
    }
    if (ch === '3' && tools[2].usesLeft > 0 && input === '') {
      setPhase('substituting');
      return;
    }
    if (ch === '4' && tools[3].usesLeft > 0 && input === '') {
      // Reveal a random unrevealed word
      const words = message.original.split(' ');
      const unrevealed = words.map((_, i) => i).filter(i => !revealedWords.has(i));
      if (unrevealed.length > 0) {
        const idx = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        setRevealedWords(prev => new Set(prev).add(idx));
        useTool('4');
      }
      return;
    }

    if (key.return) {
      handleSubmit();
      return;
    }
    if (key.backspace || key.delete) {
      setInput(prev => prev.slice(0, -1));
      return;
    }
    if (ch && !key.ctrl && !key.meta) {
      setInput(prev => prev + ch);
    }
  });

  const originalWords = message.original.split(' ');

  // Find repeated sequences for pattern tool
  const patternHighlights = useMemo(() => {
    const enc = message.encrypted.toLowerCase();
    const sequences: Map<string, number> = new Map();
    for (let len = 2; len <= 4; len++) {
      for (let i = 0; i <= enc.length - len; i++) {
        const seq = enc.slice(i, i + len);
        if (/^[a-z]+$/.test(seq)) {
          sequences.set(seq, (sequences.get(seq) || 0) + 1);
        }
      }
    }
    return [...sequences.entries()].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [message.encrypted]);

  return (
    <Box flexDirection="column" paddingX={1}>
      <Text color={colors.muted}>{'▓'.repeat(48)}</Text>
      <HUD width={48}>
        <HUDRow width={48}>
          <Transmission
            encrypted={message.encrypted}
            substitutions={substitutions}
            revealedWords={revealedWords}
            originalWords={originalWords}
          />
        </HUDRow>

        {phase === 'freq' && (
          <>
            <HUDDivider width={48} />
            <HUDRow width={48}>
              <FreqChart text={message.encrypted} />
            </HUDRow>
            <HUDRow width={48}>
              <Text color={colors.muted} dimColor>press any key to close</Text>
            </HUDRow>
          </>
        )}

        {phase === 'pattern' && (
          <>
            <HUDDivider width={48} />
            <HUDRow width={48}>
              <Box flexDirection="column">
                <Text color={colors.accent}>{'░░▒▒ PATTERN ANALYSIS ▒▒░░'}</Text>
                {patternHighlights.map(([seq, count]) => (
                  <Text key={seq} color={colors.primary}>
                    "{seq}" <Text color={colors.muted}>appears {count}x</Text>
                  </Text>
                ))}
                {patternHighlights.length === 0 && (
                  <Text color={colors.muted}>No repeated patterns found</Text>
                )}
              </Box>
            </HUDRow>
            <HUDRow width={48}>
              <Text color={colors.muted} dimColor>press any key to close</Text>
            </HUDRow>
          </>
        )}

        {phase === 'substituting' && (
          <>
            <HUDDivider width={48} />
            <HUDRow width={48}>
              <Text color={colors.accent}>
                {subFrom
                  ? `Replace '${subFrom}' with → type a letter`
                  : 'Type letter to replace →'}
              </Text>
            </HUDRow>
            <HUDRow width={48}>
              <Text color={colors.muted} dimColor>esc to cancel</Text>
            </HUDRow>
          </>
        )}

        <HUDDivider width={48} />
        <HUDRow width={48}>
          <ToolsPanel tools={tools} activeTool={phase === 'substituting' ? '3' : phase === 'freq' ? '1' : phase === 'pattern' ? '2' : null} />
        </HUDRow>

        <HUDDivider width={48} />
        <HUDRow width={48}>
          <Box>
            <Text color={colors.primary}>{'> '}</Text>
            <Text color={colors.bright}>{input}</Text>
            <Text color={colors.primary}>_</Text>
          </Box>
        </HUDRow>
      </HUD>

      <Box marginTop={0}>
        <Timer
          duration={config.timeLimit}
          onExpire={handleExpire}
          paused={phase !== 'playing'}
          onTick={setTimeRemaining}
        />
        <Text color={colors.muted}>{'  '}STREAK: </Text>
        <Text color={streak >= 3 ? colors.accent : colors.text}>{streak}</Text>
      </Box>

      <ScoreBar level={level} score={totalScore} highScore={highScore} streak={streak} />

      <Box marginTop={0}>
        <Text color={colors.muted} dimColor>
          {config.cipherType.toUpperCase()} cipher • enter to submit • 1-4 tools
        </Text>
      </Box>
    </Box>
  );
}
```

**Step 3: Commit**

```bash
git add src/
git commit -m "feat: add main game screen with full gameplay loop, tools, and input"
```

---

### Task 11: Result & Game Over Screens

**Files:**
- Create: `src/screens/result.tsx`
- Create: `src/screens/gameover.tsx`
- Create: `src/screens/scores.tsx`

**Step 1: Build round result screen**

```tsx
// src/screens/result.tsx
import React, { useState, useEffect } from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import { type ScoreResult } from '../engine/scoring.js';

interface ResultScreenProps {
  result: ScoreResult;
  won: boolean;
  originalMessage: string;
  guess: string;
  onContinue: () => void;
}

export function ResultScreen({ result, won, originalMessage, guess, onContinue }: ResultScreenProps) {
  const [glitch, setGlitch] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGlitch(false), 500);
    return () => clearTimeout(t);
  }, []);

  useInput((_, key) => {
    if (key.return || key.escape) onContinue();
  });

  if (glitch) {
    const chars = '█▓▒░╬╠╣╦╩╔╗╚╝▀▄▌▐';
    const noise = Array.from({ length: 200 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join('');
    return (
      <Box flexDirection="column" alignItems="center">
        <Text color={won ? colors.success : colors.danger}>{noise.slice(0, 50)}</Text>
        <Text color={won ? colors.success : colors.danger}>
          {won ? '  TRANSMISSION DECODED  ' : '  ██ SIGNAL LOST ██  '}
        </Text>
        <Text color={won ? colors.success : colors.danger}>{noise.slice(50, 100)}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column" alignItems="center" paddingX={2}>
      <Box marginBottom={1}>
        <Text color={won ? colors.success : colors.danger} bold>
          {won ? '▓▓ TRANSMISSION DECODED ▓▓' : '▓▓ SIGNAL LOST ▓▓'}
        </Text>
      </Box>

      <Box flexDirection="column">
        <Text color={colors.muted}>Original: <Text color={colors.bright}>{originalMessage}</Text></Text>
        <Text color={colors.muted}>Your guess: <Text color={result.perfect ? colors.success : colors.warning}>{guess || '(empty)'}</Text></Text>
      </Box>

      <Box flexDirection="column" marginTop={1}>
        <Text color={colors.text}>Words:      <Text color={colors.primary}>+{result.wordScore}</Text></Text>
        <Text color={colors.text}>Time bonus: <Text color={colors.primary}>+{result.timeBonus}</Text></Text>
        {result.multiplier > 1 && (
          <Text color={colors.text}>Multiplier: <Text color={colors.accent}>x{result.multiplier}</Text></Text>
        )}
        <Text color={colors.bright} bold>Total:      <Text color={colors.warning}>{result.total}</Text></Text>
        <Text color={colors.muted}>Accuracy:   {Math.round(result.accuracy * 100)}%</Text>
      </Box>

      <Box marginTop={1}>
        <Text color={colors.muted} dimColor>press enter to continue</Text>
      </Box>
    </Box>
  );
}
```

**Step 2: Build game over screen**

```tsx
// src/screens/gameover.tsx
import React from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';

interface GameOverProps {
  totalScore: number;
  highScore: number;
  isNewHigh: boolean;
  level: number;
  maxStreak: number;
  roundsPlayed: number;
  onPlayAgain: () => void;
  onQuit: () => void;
}

export function GameOverScreen({
  totalScore, highScore, isNewHigh, level, maxStreak, roundsPlayed, onPlayAgain, onQuit
}: GameOverProps) {
  useInput((ch, key) => {
    if (key.return) onPlayAgain();
    if (ch === 'q' || key.escape) onQuit();
  });

  return (
    <Box flexDirection="column" alignItems="center" paddingX={2}>
      <Text color={colors.danger}>{'▓'.repeat(40)}</Text>
      <Text color={colors.danger} bold>SIGNAL TERMINATED</Text>
      <Text color={colors.danger}>{'▓'.repeat(40)}</Text>

      {isNewHigh && (
        <Box marginTop={1}>
          <Text color={colors.warning} bold>★ NEW HIGH SCORE ★</Text>
        </Box>
      )}

      <Box flexDirection="column" marginTop={1}>
        <Text color={colors.text}>Final Score:  <Text color={colors.warning} bold>{totalScore.toLocaleString()}</Text></Text>
        <Text color={colors.text}>High Score:   <Text color={colors.muted}>{highScore.toLocaleString()}</Text></Text>
        <Text color={colors.text}>Level:        <Text color={colors.primary}>{level}</Text></Text>
        <Text color={colors.text}>Max Streak:   <Text color={colors.accent}>{maxStreak}</Text></Text>
        <Text color={colors.text}>Rounds:       <Text color={colors.text}>{roundsPlayed}</Text></Text>
      </Box>

      <Box flexDirection="column" marginTop={1} alignItems="center">
        <Text color={colors.primary}>enter — play again</Text>
        <Text color={colors.muted}>q — quit</Text>
      </Box>
    </Box>
  );
}
```

**Step 3: Build high scores screen**

```tsx
// src/screens/scores.tsx
import React from 'react';
import { Box, Text, useInput } from 'ink';
import { colors } from '../theme.js';
import { loadScores, type HighScore } from '../utils/storage.js';

interface ScoresScreenProps {
  onBack: () => void;
}

export function ScoresScreen({ onBack }: ScoresScreenProps) {
  const scores = loadScores();

  useInput((_, key) => {
    if (key.escape || key.return) onBack();
  });

  return (
    <Box flexDirection="column" alignItems="center" paddingX={2}>
      <Text color={colors.accent}>{'░░▒▒▓▓ HIGH SCORES ▓▓▒▒░░'}</Text>
      <Box flexDirection="column" marginTop={1}>
        {scores.length === 0 && (
          <Text color={colors.muted}>No scores yet. Start intercepting!</Text>
        )}
        {scores.map((s, i) => (
          <Box key={i}>
            <Text color={i === 0 ? colors.warning : colors.text}>
              {String(i + 1).padStart(2, ' ')}. {String(s.score).padStart(8, ' ')}
            </Text>
            <Text color={colors.muted}>
              {'  '}LVL {s.level}  STR {s.streak}  {s.date}
            </Text>
          </Box>
        ))}
      </Box>
      <Box marginTop={1}>
        <Text color={colors.muted} dimColor>press any key to go back</Text>
      </Box>
    </Box>
  );
}
```

**Step 4: Commit**

```bash
git add src/screens/
git commit -m "feat: add result, game over, and high scores screens"
```

---

### Task 12: Wire Everything Together in App

**Files:**
- Modify: `src/app.tsx`

**Step 1: Full app with screen routing and game state**

```tsx
// src/app.tsx
import React, { useState, useCallback } from 'react';
import { Box, useApp } from 'ink';
import { TitleScreen } from './screens/title.js';
import { GameScreen } from './screens/game.js';
import { ResultScreen } from './screens/result.js';
import { GameOverScreen } from './screens/gameover.js';
import { ScoresScreen } from './screens/scores.js';
import { getHighScore, saveScore } from './utils/storage.js';
import { type ScoreResult } from './engine/scoring.js';
import { type EncryptedMessage } from './engine/ciphers.js';

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

  const handleQuit = useCallback(() => exit(), [exit]);

  const handleStartGame = useCallback(() => {
    setLevel(1);
    setTotalScore(0);
    setStreak(0);
    setMaxStreak(0);
    setRoundsPlayed(0);
    setScreen('game');
  }, []);

  const handleRoundEnd = useCallback((result: RoundResult) => {
    setLastResult(result);
    setTotalScore(prev => prev + result.score.total);
    setRoundsPlayed(prev => prev + 1);

    if (result.won) {
      setStreak(prev => {
        const next = prev + 1;
        setMaxStreak(m => Math.max(m, next));
        return next;
      });
      setLevel(prev => prev + 1);
      setScreen('result');
    } else {
      // Game over on fail
      setStreak(0);
      setScreen('result');
    }
  }, []);

  const handleContinueFromResult = useCallback(() => {
    if (lastResult?.won) {
      setScreen('game');
    } else {
      // Save score and show game over
      const finalScore = totalScore + (lastResult?.score.total ?? 0);
      const isNewHigh = finalScore > highScore;
      if (isNewHigh) setHighScore(finalScore);
      saveScore({
        score: finalScore,
        level,
        streak: maxStreak,
        date: new Date().toISOString().split('T')[0],
      });
      setScreen('gameover');
    }
  }, [lastResult, totalScore, highScore, level, maxStreak]);

  return (
    <Box flexDirection="column">
      {screen === 'title' && (
        <TitleScreen
          highScore={highScore}
          onPlay={handleStartGame}
          onScores={() => setScreen('scores')}
          onQuit={handleQuit}
        />
      )}
      {screen === 'game' && (
        <GameScreen
          key={`level-${level}-${roundsPlayed}`}
          onRoundEnd={handleRoundEnd}
          level={level}
          totalScore={totalScore}
          highScore={highScore}
          streak={streak}
        />
      )}
      {screen === 'result' && lastResult && (
        <ResultScreen
          result={lastResult.score}
          won={lastResult.won}
          originalMessage={lastResult.message.original}
          guess={lastResult.guess}
          onContinue={handleContinueFromResult}
        />
      )}
      {screen === 'gameover' && (
        <GameOverScreen
          totalScore={totalScore}
          highScore={highScore}
          isNewHigh={totalScore >= highScore}
          level={level}
          maxStreak={maxStreak}
          roundsPlayed={roundsPlayed}
          onPlayAgain={handleStartGame}
          onQuit={handleQuit}
        />
      )}
      {screen === 'scores' && (
        <ScoresScreen onBack={() => setScreen('title')} />
      )}
    </Box>
  );
}
```

**Step 2: Run and test full game flow**

Run: `npm run dev`
Expected: Full game — title → play → decode → result → continue or game over

**Step 3: Commit**

```bash
git add src/
git commit -m "feat: wire all screens together with full game state management"
```

---

### Task 13: Polish & Package for npx

**Files:**
- Modify: `package.json`
- Modify: `src/index.tsx`

**Step 1: Add shebang and finalize package.json**

Ensure `src/index.tsx` has the shebang line at top:
```tsx
#!/usr/bin/env node
```

Update `package.json` with full metadata:
```json
{
  "name": "signal-decode",
  "version": "1.0.0",
  "description": "A cyberpunk code-breaking terminal game",
  "type": "module",
  "bin": {
    "signal": "./dist/index.js"
  },
  "files": ["dist"],
  "scripts": {
    "dev": "tsx src/index.tsx",
    "build": "tsc",
    "prepublishOnly": "npm run build",
    "test": "tsx --test src/**/*.test.ts"
  },
  "keywords": ["terminal", "game", "cipher", "cyberpunk", "cli"],
  "license": "MIT"
}
```

**Step 2: Build and test locally**

```bash
npm run build
node dist/index.js
```

Expected: Game runs from compiled output

**Step 3: Test npx-style execution**

```bash
npm link
signal
```

Expected: Running `signal` launches the game

**Step 4: Commit**

```bash
git add .
git commit -m "feat: finalize packaging for npx distribution"
```

---

### Task 14: End-to-End Playtest & Bug Fixes

**Step 1: Play through 3+ rounds, verify:**
- Title screen navigation works
- Timer counts down and changes color
- All 4 tools work correctly
- Substitution mode works (type 2 letters)
- Frequency chart shows correct data
- Scoring calculates correctly
- Streak multiplier applies
- Game over triggers on failed decode
- High scores save and display
- Quit works cleanly

**Step 2: Fix any bugs found during playtest**

**Step 3: Final commit**

```bash
git add .
git commit -m "fix: playtest bug fixes and polish"
```
