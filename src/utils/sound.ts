import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { platform } from 'node:os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SOUNDS_DIR = resolve(__dirname, '../../assets/sounds');
const os = platform();

export type SoundEvent = 'boot' | 'correct' | 'wrong' | 'tick' | 'complete' | 'gameover' | 'keypress' | 'backspace' | 'levelup';

let _muted = false;

// Throttle rapid sounds (keypress/backspace) — skip if last one was < 30ms ago
let _lastRapidTime = 0;
const RAPID_EVENTS = new Set<SoundEvent>(['keypress', 'backspace']);
const RAPID_THROTTLE_MS = 30;

export function setMuted(muted: boolean): void {
  _muted = muted;
}

export function isMuted(): boolean {
  return _muted;
}

/** Fire-and-forget cross-platform sound playback. Detached + unref'd for zero latency. */
export function playSound(event: SoundEvent): void {
  if (_muted) return;

  // Throttle rapid-fire sounds
  if (RAPID_EVENTS.has(event)) {
    const now = Date.now();
    if (now - _lastRapidTime < RAPID_THROTTLE_MS) return;
    _lastRapidTime = now;
  }

  const file = resolve(SOUNDS_DIR, `${event}.wav`);
  if (!existsSync(file)) return;

  try {
    let child;
    if (os === 'darwin') {
      child = spawn('afplay', [file], { stdio: 'ignore', detached: true });
    } else if (os === 'win32') {
      child = spawn('powershell', ['-c', `(New-Object Media.SoundPlayer '${file}').PlaySync()`], { stdio: 'ignore', detached: true });
    } else {
      // Linux — try paplay first
      child = spawn('paplay', [file], { stdio: 'ignore', detached: true });
    }
    child.unref();
  } catch {
    // silently ignore
  }
}
