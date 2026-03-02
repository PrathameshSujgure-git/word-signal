# Signal — Terminal Code-Breaking Game

## Overview
A cyberpunk-themed code-breaking puzzle game that runs entirely in the terminal. Distributed via `npx signal-decode`. You intercept encrypted transmissions and decode them using limited tools before time runs out.

## Tech Stack
- **Runtime:** Node.js / TypeScript
- **Terminal UI:** Ink (React for terminal) + ink-big-text, chalk
- **Distribution:** npm package, runnable via `npx signal-decode`
- **Data:** Local scores stored in `~/.signal/scores.json`

## Gameplay

### Round Flow
1. Transmission appears with cascade/glitch animation
2. 60-second countdown starts
3. Player uses hotkey tools to analyze the cipher
4. Player types decoded answer and submits with Enter
5. Score based on accuracy + time remaining + streak multiplier

### Cipher Progression
| Levels | Type | Description |
|--------|------|-------------|
| 1-3 | Caesar | Simple letter shift (shift 1-5) |
| 4-6 | Substitution | Full alphabet mapping |
| 7-9 | Vigenere | Multi-key polyalphabetic |
| 10+ | Mixed | Combined ciphers, noise characters |

### Tools (hotkeys during gameplay)
- **[1] Freq Scan** (3 uses) — Letter frequency bar chart
- **[2] Pattern Match** (3 uses) — Highlights repeated sequences, suggests common words
- **[3] Substitute** (5 uses) — Swap one letter for another across entire message
- **[4] Hint** (1 use) — Reveals one word, 50% score penalty on that word

### Scoring
- Base: 100 points per correct word
- Time bonus: +2 points per second remaining
- Streak multiplier: x1.5 at streak 3, x2 at streak 5, x3 at streak 10
- Partial credit: % of correct characters

### Messages Source
- Curated pool of 100+ famous quotes, proverbs, and sci-fi references
- Messages are 4-10 words long for quick rounds

## UI Design — Cyberpunk HUD

### Color Palette
- Background: terminal default (black)
- Primary text: cyan (#00FFFF)
- Accent: magenta (#FF00FF)
- Warning: yellow (#FFD700)
- Danger: red (#FF4444)
- Success: green (#00FF88)
- Muted: dim gray

### Layout (top to bottom)
```
┌─────────────────────────────────────────┐
│ ▓▓▓▓▓▓▓▓▓▓▓▓ SIGNAL v1.0 ▓▓▓▓▓▓▓▓▓▓▓▓ │  <- Header with scan line effect
│ ╔══════════════════════════════════════╗ │
│ ║ ░░▒▒▓▓ INTERCEPTED ▓▓▒▒░░          ║ │  <- Transmission label
│ ║                                     ║ │
│ ║  Wkh#txlfn#eurzq#ira#mxpsv         ║ │  <- Encrypted message
│ ║  ▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌▌          ║ │  <- Decoded progress
│ ║                                     ║ │
│ ╠══════════════════════════════════════╣ │
│ ║ ▸ FREQ SCAN [██░░] 2/3              ║ │  <- Tool panel
│ ║ ▸ PATTERN   [███░] 3/3              ║ │
│ ║ ▸ SUBST     [█░░░] 1/5              ║ │
│ ║ ▸ HINT      [█] 1/1                 ║ │
│ ╠══════════════════════════════════════╣ │
│ ║ > your decoded answer here_         ║ │  <- Input area
│ ╚══════════════════════════════════════╝ │
│ ⏱ ████████████░░░░░░░░  38s  STREAK: 4 │  <- Timer + stats
│ LVL: 3  SCORE: 1,250  HIGH: 4,800      │  <- Score bar
└─────────────────────────────────────────┘
```

### Screens
1. **Title screen** — ASCII art "SIGNAL" logo with glitch animation, menu (Play / High Scores / Quit)
2. **Gameplay** — Main HUD as shown above
3. **Freq Scan overlay** — Bar chart appears inline showing letter frequencies
4. **Pattern overlay** — Highlighted sequences in the encrypted text
5. **Round result** — "DECODED" (green flash) or "SIGNAL LOST" (red static)
6. **Game over** — Final stats, streak, score breakdown, high score comparison

### Animations
- **Transmission arrival:** Characters cascade in randomly, then snap to position
- **Timer:** Smooth color transition green → yellow → red
- **Decode success:** Brief green flash, "TRANSMISSION DECODED" with static clearing
- **Decode fail:** Screen briefly corrupts with random characters, "SIGNAL LOST"
- **Substitution:** Swapped letters ripple across the message
- **Streak milestone:** Brief screen border flash on hitting x1.5, x2, x3

## Project Structure
```
signal-game/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.tsx          # Entry point, npx handler
│   ├── app.tsx            # Main app component (screen router)
│   ├── screens/
│   │   ├── title.tsx      # Title screen with ASCII art
│   │   ├── game.tsx       # Main gameplay screen
│   │   ├── result.tsx     # Round result screen
│   │   └── gameover.tsx   # Game over / high scores
│   ├── components/
│   │   ├── hud.tsx        # Main HUD frame/border
│   │   ├── transmission.tsx # Encrypted message display
│   │   ├── tools.tsx      # Tool panel
│   │   ├── timer.tsx      # Countdown timer bar
│   │   ├── input.tsx      # Answer input field
│   │   ├── freq-chart.tsx # Frequency analysis overlay
│   │   └── scorebar.tsx   # Score/level/streak display
│   ├── engine/
│   │   ├── ciphers.ts     # Caesar, substitution, vigenere implementations
│   │   ├── messages.ts    # Message pool
│   │   ├── scoring.ts     # Score calculation
│   │   └── difficulty.ts  # Level progression logic
│   ├── utils/
│   │   ├── animation.ts   # Glitch, cascade, flash effects
│   │   └── storage.ts     # Local score persistence (~/.signal/)
│   └── theme.ts           # Colors, borders, style constants
├── docs/
│   └── plans/
└── README.md (only if needed)
```

## Distribution
- Package name: `signal-decode` (or similar available name)
- Binary: `signal` command
- Run: `npx signal-decode`
- No external dependencies beyond npm packages
