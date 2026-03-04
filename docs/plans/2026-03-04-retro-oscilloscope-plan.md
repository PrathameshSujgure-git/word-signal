# Retro Oscilloscope Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the 1-row FREQ bar visualizer with a reactive 4-row retro oscilloscope + add a YouTube-style "Stats for Nerds" overlay.

**Architecture:** Create a `ScopeEvent` type and context so game events flow from `game.tsx` → `ScreenLayout` → `SignalScope`. The scope renders 3 waveform rows + 1 data readout row using box-drawing chars, with event-driven animations. A `StatsForNerds` overlay renders in the top-right corner of ScreenLayout over the matrix rain, toggled with `[0]`, visible by default.

**Tech Stack:** React/Ink, box-drawing Unicode chars, layered sine wave math, shared context for events.

---

### Task 1: Create scope event context

**Files:**
- Create: `src/components/scope-context.tsx`

**Step 1: Write the context**

```tsx
import { createContext, useContext, useRef, useCallback } from 'react';

export type ScopeEventType = 'correct' | 'wrong' | 'skip' | 'flatline';

export interface ScopeEvent {
  type: ScopeEventType;
  timestamp: number;
}

interface ScopeContextValue {
  pushEvent: (type: ScopeEventType) => void;
  consumeEvents: () => ScopeEvent[];
}

const ScopeContext = createContext<ScopeContextValue | null>(null);

export function ScopeProvider({ children }: { children: React.ReactNode }) {
  const queueRef = useRef<ScopeEvent[]>([]);

  const pushEvent = useCallback((type: ScopeEventType) => {
    queueRef.current.push({ type, timestamp: Date.now() });
  }, []);

  const consumeEvents = useCallback(() => {
    const events = queueRef.current;
    queueRef.current = [];
    return events;
  }, []);

  return (
    <ScopeContext.Provider value={{ pushEvent, consumeEvents }}>
      {children}
    </ScopeContext.Provider>
  );
}

export function useScopeEvents() {
  const ctx = useContext(ScopeContext);
  if (!ctx) return null;
  return ctx;
}
```

**Step 2: Commit**
```bash
git add src/components/scope-context.tsx
git commit -m "feat: add scope event context for oscilloscope"
```

---

### Task 2: Rewrite news-ticker.tsx → SignalScope

**Files:**
- Rewrite: `src/components/news-ticker.tsx` → rename export to `SignalScope`

This is the main component. It renders 4 rows:

**Row structure:**
- Rows 0-2: Waveform (top/center/bottom) — box-drawing chars
- Row 3: Data readout — frequency, lock status, peak, SNR bar

**Waveform rendering approach:**
- Sample N points across terminal width (1 per column)
- Each sample = layered sine waves + noise + event modifiers
- Map sample amplitude (-1 to +1) to 3-row vertical position:
  - amplitude > 0.33: draw in row 0 (top)
  - amplitude -0.33 to 0.33: draw in row 1 (center)
  - amplitude < -0.33: draw in row 2 (bottom)
- Use chars: `╷│╽` (top), `─┼╫` (center crossing), `╵│╿` (bottom)
- Grid dots `·` at regular intervals (every 8 cols)
- Peak hold markers: track max per column, decay over ~25 ticks

**Event animations:**
- `correct`: inject a sharp gaussian spike at random position, amplitude 1.0, width ~6 cols, decays over 8 ticks
- `wrong`: set noise multiplier to 3x for 6 ticks (500ms), add red color tint
- `skip`: force all amplitudes to 0 for 4 ticks (320ms)
- `flatline`: permanent zero amplitude

**Data readout (row 3):**
- Format: `╰ 47.2kHz ▸▸ LOCK ─── PK+0.83 ─── δ12.4ms ─── ████░░░░ SNR ╯`
- Frequency: `baseFreq + sin(tick*0.02)*5` — slowly drifts
- Lock: always `LOCK` during game, `SCAN` on title
- Peak: max amplitude this tick
- SNR bar: 8-char bar, drops on `wrong` events, recovers slowly

**Colors:**
- Waveform: `colors.green` (bright), `colors.border` (grid dots)
- Peak hold: `colors.cyan`
- Wrong event: `colors.red` for waveform during noise burst
- Readout labels: `colors.textDim`, values: `colors.green`
- Border chars (╭╰╮╯│): `colors.borderHi`

**Step 1: Write the SignalScope component**

Full implementation in `src/components/news-ticker.tsx` (keeping the filename to minimize import changes, just changing the export name).

Actually — rename the file to `signal-scope.tsx` for clarity since `screen-layout.tsx` is the only importer.

**Files:**
- Create: `src/components/signal-scope.tsx`
- Delete: `src/components/news-ticker.tsx`

The component:
- Accepts no props (reads events from context)
- 80ms tick interval (same as before)
- Uses `useScopeEvents()` to consume events each tick
- Maintains refs for: waveform samples, peak hold, event state, SNR level, noise multiplier

**Step 2: Verify it compiles**
Run: `npx tsc --noEmit`

**Step 3: Commit**
```bash
git add src/components/signal-scope.tsx
git rm src/components/news-ticker.tsx
git commit -m "feat: replace NewsTicker with SignalScope oscilloscope"
```

---

### Task 3: Update ScreenLayout to use SignalScope

**Files:**
- Modify: `src/components/screen-layout.tsx`

**Changes:**
1. Replace `import { NewsTicker }` with `import { SignalScope }`
2. Change `availableHeight` calc: subtract 4 instead of 1 for ticker height
3. Replace `<NewsTicker />` with `<SignalScope />`

**Step 1: Make the changes**

In `screen-layout.tsx`:
- Line 5: `import { SignalScope } from './signal-scope.js';` (replace NewsTicker import)
- Line 96: `const tickerHeight = showTicker ? 4 : 0;` then `const availableHeight = termHeight - tickerHeight;`
- Line 241: `{showTicker && <SignalScope />}` (replace NewsTicker)

**Step 2: Verify**
Run: `npx tsc --noEmit`

**Step 3: Commit**
```bash
git add src/components/screen-layout.tsx
git commit -m "feat: wire SignalScope into ScreenLayout"
```

---

### Task 4: Wrap App in ScopeProvider and fire events from game.tsx

**Files:**
- Modify: `src/app.tsx` — wrap return in `<ScopeProvider>`
- Modify: `src/screens/game.tsx` — call `pushEvent` on correct/wrong/skip/flatline

**Step 1: Wrap App**

In `src/app.tsx`:
- Import `ScopeProvider` from `../components/scope-context.js`
- Wrap the entire returned JSX in `<ScopeProvider>...</ScopeProvider>`

**Step 2: Fire events in game.tsx**

In `src/screens/game.tsx`:
- Import `useScopeEvents` from `../components/scope-context.js`
- At top of `GameScreen`: `const scope = useScopeEvents();`
- After each `playSound('correct')`: add `scope?.pushEvent('correct');`
- After each `playSound('wrong')`: add `scope?.pushEvent('wrong');`
- After `playSound('tick')` in skip handler: add `scope?.pushEvent('skip');`
- In `finishRound` after `setSubmitted(true)`: add `scope?.pushEvent('flatline');`

**Step 3: Verify**
Run: `npx tsc --noEmit`

**Step 4: Manual test**
Run: `npm run dev`
- Oscilloscope should show at bottom with 4 rows
- Correct answers → spike animation
- Wrong answers → noise burst
- Skip → brief flatline
- Game end → permanent flatline

**Step 5: Commit**
```bash
git add src/app.tsx src/screens/game.tsx
git commit -m "feat: wire game events to oscilloscope via context"
```

---

### Task 5: Polish and tune

**Files:**
- Modify: `src/components/signal-scope.tsx` — tune animation params

**Tuning checklist:**
- [ ] Waveform looks smooth and organic (adjust sine frequencies/amplitudes)
- [ ] Spike animation is visible but not jarring (adjust gaussian width/decay)
- [ ] Noise burst on wrong is dramatic enough (adjust multiplier/duration)
- [ ] Flatline transition is smooth (fade over 5+ ticks)
- [ ] Data readout fits terminal width (test at 80 cols)
- [ ] Colors match theme (green waveform, red on wrong, cyan peaks)
- [ ] No performance issues at 80ms interval

**Step 1: Test at 80-col terminal width and tune**
**Step 2: Commit**
```bash
git add src/components/signal-scope.tsx
git commit -m "fix: tune oscilloscope animation parameters"
```

---

### Task 6: Create StatsForNerds overlay component

**Files:**
- Create: `src/components/stats-for-nerds.tsx`

YouTube "Stats for Nerds"-style overlay in the top-right corner, over the matrix rain. Visible by default, toggled with `[0]`.

**Visual layout:**
```
┌ Stats for Nerds ─────────────┐
│ Level / Round    3 / 5        │
│ Score            1,240        │
│ Streak           2 (x1.5)    │
│ Lives            ♥♥♥♥♡♡♡     │
│ Words            2/4 solved   │
│ Wrong Count      1            │
│ Tools Used       3            │
│ Cipher           ROT-13+SWAP │
│ Signal Freq      47.2 kHz    │
│ Decode Rate      842 sym/s   │
│ Entropy          3.21 bits   │
│ Latency          12.4 ms     │
│ Packet Loss      0.2%        │
│ Uptime           00:02:14    │
└──────────────────────────────┘
```

**Props:**
```tsx
interface StatsForNerdsProps {
  level: number;
  score: number;
  streak: number;
  lives: number;
  maxLives: number;
  wordsSolved: number;
  wordsTotal: number;
  wrongCount: number;
  toolUses: number;
  timeRemaining: number;
}
```

**Fake stats (cosmetic, computed from tick/seed):**
- Cipher: pick from `['ROT-13+SWAP', 'VIGENERE-7', 'CAESAR-Δ', 'XOR-FF', 'ENIGMA-M3']` based on level
- Signal Freq: `42.0 + sin(tick*0.02)*5` kHz — slowly drifts
- Decode Rate: `800 + random()*100` sym/s
- Entropy: `2.5 + level*0.3 + noise` bits
- Latency: `8 + random()*10` ms
- Packet Loss: `0.1 + random()*0.5`%
- Uptime: real elapsed time since game start

**Colors:**
- Border/title: `colors.borderHi` / `colors.textDim`
- Labels: `colors.textDim`
- Real values: `colors.text`
- Fake values: `colors.green` (techy feel)

**Step 1: Write the component**

**Step 2: Verify**
Run: `npx tsc --noEmit`

**Step 3: Commit**
```bash
git add src/components/stats-for-nerds.tsx
git commit -m "feat: add Stats for Nerds overlay component"
```

---

### Task 7: Wire StatsForNerds into ScreenLayout + toggle from game.tsx

**Files:**
- Modify: `src/components/screen-layout.tsx` — render overlay in top-right
- Modify: `src/screens/game.tsx` — add `[0]` toggle, pass stats props through ScreenLayout

**Approach:**
- `ScreenLayout` gets a new optional `statsOverlay` prop (ReactNode) to render in top-right
- `game.tsx` manages `showStats` state (default `true`), key `0` toggles it
- When `showStats` is true, game.tsx passes `<StatsForNerds ...props />` as the `statsOverlay`

**In screen-layout.tsx:**
- Add `statsOverlay?: React.ReactNode` to `ScreenLayoutProps`
- In the top rain section, overlay the stats component in the top-right corner using absolute positioning via Ink's `marginLeft`
- Render stats overlay after top rain rows, positioned to top-right

**In game.tsx:**
- Add `const [showStats, setShowStats] = useState(true);`
- In `useInput`: `if (ch === '0') { setShowStats(s => !s); return; }` (before submitted check — works always)
- Pass stats overlay to ScreenLayout:
  ```tsx
  <ScreenLayout
    statsOverlay={showStats ? <StatsForNerds level={level} score={totalScore} ... /> : undefined}
  >
  ```

**Step 1: Update ScreenLayout**
**Step 2: Update game.tsx**
**Step 3: Verify**
Run: `npx tsc --noEmit`

**Step 4: Commit**
```bash
git add src/components/screen-layout.tsx src/screens/game.tsx src/components/stats-for-nerds.tsx
git commit -m "feat: wire Stats for Nerds overlay with [0] toggle"
```
