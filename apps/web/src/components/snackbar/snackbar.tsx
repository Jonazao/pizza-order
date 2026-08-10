'use client';

import { ReactNode, createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

type SnackbarType = 'success' | 'error';

interface SnackbarItem {
  id: number;
  message: string;
  type: SnackbarType;
}

interface SnackbarContextValue {
  success: (message: string) => void;
  error: (message: string) => void;
}

const AUTO_DISMISS_MS = 3000;

const SnackbarContext = createContext<SnackbarContextValue | null>(null);

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SnackbarItem[]>([]);
  const idRef = useRef(0);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const push = useCallback(
    (message: string, type: SnackbarType) => {
      const id = ++idRef.current;
      setItems((prev) => [...prev, { id, message, type }]);
      setTimeout(() => dismiss(id), AUTO_DISMISS_MS);
    },
    [dismiss]
  );

  const value = useMemo<SnackbarContextValue>(
    () => ({
      success: (message: string) => push(message, 'success'),
      error: (message: string) => push(message, 'error'),
    }),
    [push]
  );

  return (
    <SnackbarContext.Provider value={value}>
      {children}

      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2.5 w-[320px] max-w-[calc(100vw-3rem)]">
        {items.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-2xl border shadow-lg flex items-start justify-between gap-3 ${
              item.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
            role="status"
          >
            <p className="text-xs font-medium leading-relaxed break-words">{item.message}</p>
            <button
              onClick={() => dismiss(item.id)}
              className="shrink-0 text-xs font-bold opacity-60 hover:opacity-100 transition cursor-pointer"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) {
    throw new Error('useSnackbar must be used within a SnackbarProvider');
  }
  return ctx;
}
