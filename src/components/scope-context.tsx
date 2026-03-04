import React, { createContext, useContext, useRef, useCallback } from 'react';

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
