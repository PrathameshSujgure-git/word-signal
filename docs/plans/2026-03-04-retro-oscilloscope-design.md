# Retro Oscilloscope Visualizer

## What
Replace the 1-row FREQ bar visualizer with a 4-row retro oscilloscope that reacts to game events.

## Visual Layout (4 rows)
```
╭ SIGNAL SCOPE ─────────────────────────────────────────────────────────╮
│    ╷    ·    ╷         ·╷        ╷·    ╷         ╷    ·              │  row 1: peaks
│────┼─·──╫────┼──╫──·───┼────╫────┼──·──┼───╫─────┼──·───────────────│  row 2: center + body
│    ╵    ·    ╵    ·     ╵        ╵·    ╵         ╵    ·              │  row 3: valleys
╰ 47.2kHz ▸▸ LOCK ─── PKᐩ0.83 ─── δ12.4ms ─── ████░░░░ SNR ──────────╯
```

## Rows 1-3: Waveform Area
- Smooth waveform trace using box-drawing chars for vertical displacement
- Characters map waveform amplitude to row position:
  - Row 1 (top): peaks above center — `╷ │ ╽` for varying heights
  - Row 2 (center): baseline — `─` with `┼ ╫` where waveform crosses
  - Row 3 (bottom): valleys below center — `╵ │ ╿` for varying depths
- CRT phosphor color gradient: bright green at waveform, dim green for grid dots
- Dotted grid lines at regular intervals (`·`) like scope graticule
- Peak hold: bright markers at max amplitude that decay over ~2s

## Row 4: Data Readout
- Frequency: slowly drifting value like `47.2kHz`
- Lock status: `SCAN` (ambient) / `LOCK` (during gameplay)
- Peak amplitude: `PK+0.83` style
- Latency/delta: `δ12.4ms` (cosmetic, drifts)
- SNR bar: `████░░░░` filled bar

## Game Event Reactions
- **Correct answer**: Sharp upward spike that propagates across waveform, brief peak hold
- **Wrong answer**: Noise burst — waveform goes jagged/chaotic for ~500ms, SNR drops
- **Skip**: Brief flatline (~300ms) then resume
- **Timer low (<10s)**: Waveform becomes more erratic, frequency scanning speeds up
- **Game over / submitted**: Waveform decays to flatline

## Implementation
- Rewrite `NewsTicker` component → `SignalScope`
- Add event system: expose `scopeEvent` callback or use a shared ref/context
- Game screen passes events via prop or ref
- Keep 80ms tick interval, add event queue that triggers animations
- Update `ScreenLayout` to render `SignalScope` instead of `NewsTicker`

## Files to Modify
| File | Change |
|------|--------|
| `src/components/news-ticker.tsx` | Rewrite as `SignalScope` — 4-row oscilloscope |
| `src/components/screen-layout.tsx` | Import `SignalScope`, replace `NewsTicker` |
| `src/screens/game.tsx` | Pass game events to scope (correct/wrong/skip) |
