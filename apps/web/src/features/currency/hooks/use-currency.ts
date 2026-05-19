'use client';

import { useShallow } from 'zustand/react/shallow';

import { convertCurrency, useCurrencyStore } from '../store';

export function useCurrencies() {
  return useCurrencyStore((s) => s.currencies);
}

export function useRates() {
  return useCurrencyStore((s) => s.rates);
}

export function useCurrencyActions() {
  return useCurrencyStore(
    useShallow((s) => ({
      upsertRate: s.upsertRate,
      removeRate: s.removeRate,
    })),
  );
}

export function useConvert() {
  const rates = useRates();
  return (amount: number, from: string, to: string) => convertCurrency(amount, from, to, rates);
}
