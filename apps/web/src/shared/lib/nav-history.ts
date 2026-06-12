'use client';

import { create } from 'zustand';

const MAX = 20;

type NavHistoryState = {
  stack: string[];
  record: (path: string) => void;
  previous: () => string | null;
};

export const useNavHistory = create<NavHistoryState>((set, get) => ({
  stack: [],
  record: (path) =>
    set((s) => {
      if (s.stack[s.stack.length - 1] === path) return s;
      return { stack: [...s.stack, path].slice(-MAX) };
    }),
  previous: () => {
    const { stack } = get();
    return stack.length > 1 ? (stack[stack.length - 2] ?? null) : null;
  },
}));
