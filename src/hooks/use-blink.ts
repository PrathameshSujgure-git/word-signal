import { useState, useEffect } from 'react';

/** Returns a boolean that toggles on/off at the given interval (ms). */
export function useBlink(intervalMs: number = 500, enabled: boolean = true): boolean {
  const [on, setOn] = useState(true);

  useEffect(() => {
    if (!enabled) {
      setOn(true);
      return;
    }
    const id = setInterval(() => setOn((prev) => !prev), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);

  return on;
}
