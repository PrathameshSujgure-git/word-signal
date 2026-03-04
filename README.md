# SIGNAL

A word-unscrambling arcade game for the terminal. Decode intercepted transmissions before time runs out.

[![npm](https://img.shields.io/npm/v/word-signal)](https://www.npmjs.com/package/word-signal)

## Play

```bash
npx word-signal
```

Requires Node.js 20+.

## How It Works

Scrambled words appear on screen. Type the correct word and press **Space** to submit. Solve 60% of words in a phrase to advance. Fail and you lose a life.

```
  Scrambled:  MEHTSY   REAC   VLOEINVG
  You type:   systems  are    evolving
```

## Controls

| Key | Action |
|-----|--------|
| `A-Z` | Type letters |
| `Space` | Submit word |
| `Backspace` | Delete letter |
| `Tab` / `Shift+Tab` | Jump between words |
| `Esc` | Back to menu |
| `5` | Toggle mute |
| `6` | Open guide |

## Lifelines

| Key | Tool | Effect |
|-----|------|--------|
| `1` | REVEAL | Show all letters of a random word (still must type it) |
| `2` | HINT | Reveal one letter in the current word |
| `3` | FIRST | Show first letter of every unsolved word |
| `4` | SKIP | Skip the entire phrase, no life lost |

Tools have limited uses that decrease as levels get harder.

## Scoring

- **Per word**: `word_length x 20` points (0 if hinted or skipped)
- **Time bonus**: `seconds_remaining x 3` (only if all words solved)
- **Tool penalty**: `-10` per tool use
- **Streak multiplier**: 1.5x at 3 wins, 2x at 5, 3x at 10+

## Difficulty

25+ levels across 7 tiers. Time drops from 75s to 30s. Phrases grow longer. Tools get scarcer.

| Tier | Levels | Time | Words |
|------|--------|------|-------|
| Tutorial | 1-4 | 75-69s | 3-4 words, max 5 letters |
| Easy | 5-8 | 67-61s | 3-5 words, max 6 letters |
| Medium | 9-12 | 59-53s | 3-5 words, max 7 letters |
| Hard | 17-20 | 43-37s | 4-7 words, any length |
| Insane | 25+ | 30s | 5-9 words, minimal tools |

## Features

- **Matrix rain** background with ASCII critters that roam and get killed by periodic red waterfall sweeps
- **Signal oscilloscope** at the bottom reacting to gameplay events in real-time
- **Sound effects** for every interaction — keypress, correct, wrong, level up, game over (cross-platform: macOS, Linux, Windows)
- **Procedurally generated phrases** from an AI/singularity themed word bank — never the same game twice
- **Local high scores** persisted to `~/.word-signal/`
- **Quit animation** — white-green waterfall eats the screen before exit

## Stack

React + [Ink](https://github.com/vadimdemedes/ink) + TypeScript. Renders to the terminal at 80ms ticks. No electron, no browser — pure terminal.

## Development

```bash
git clone https://github.com/PrathameshSujgure-git/word-signal.git
cd word-signal
npm install
npm run dev     # watch mode
npm run build   # compile to dist/
npm test        # run tests
```

## License

ISC

---

*made with [claude code](https://claude.ai/claude-code) and ♥ by [@invinciDesigns](https://x.com/invinciDesigns)*
