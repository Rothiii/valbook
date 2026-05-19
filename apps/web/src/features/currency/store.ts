'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { Currency, ExchangeRate } from './types';

export const BUILTIN_CURRENCIES: Currency[] = [
  { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp', decimalPlaces: 0 },
  { code: 'USD', name: 'US Dollar', symbol: '$', decimalPlaces: 2 },
  { code: 'EUR', name: 'Euro', symbol: '€', decimalPlaces: 2 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', decimalPlaces: 2 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', decimalPlaces: 0 },
  { code: 'BTC', name: 'Bitcoin', symbol: '₿', decimalPlaces: 8 },
  { code: 'ETH', name: 'Ethereum', symbol: 'Ξ', decimalPlaces: 8 },
  { code: 'USDT', name: 'Tether', symbol: '₮', decimalPlaces: 6 },
];

type CurrencyState = {
  currencies: Currency[];
  rates: ExchangeRate[];
};

type CurrencyActions = {
  upsertRate: (rate: Omit<ExchangeRate, 'validFrom'>) => void;
  removeRate: (fromCurrency: string, toCurrency: string) => void;
  reset: () => void;
};

const SEED_RATES: ExchangeRate[] = [
  {
    fromCurrency: 'USD',
    toCurrency: 'IDR',
    rate: 15800,
    source: 'manual',
    validFrom: new Date().toISOString(),
  },
  {
    fromCurrency: 'EUR',
    toCurrency: 'IDR',
    rate: 17200,
    source: 'manual',
    validFrom: new Date().toISOString(),
  },
  {
    fromCurrency: 'SGD',
    toCurrency: 'IDR',
    rate: 11700,
    source: 'manual',
    validFrom: new Date().toISOString(),
  },
  {
    fromCurrency: 'JPY',
    toCurrency: 'IDR',
    rate: 105,
    source: 'manual',
    validFrom: new Date().toISOString(),
  },
  {
    fromCurrency: 'BTC',
    toCurrency: 'USD',
    rate: 95000,
    source: 'manual',
    validFrom: new Date().toISOString(),
  },
  {
    fromCurrency: 'ETH',
    toCurrency: 'USD',
    rate: 3400,
    source: 'manual',
    validFrom: new Date().toISOString(),
  },
  {
    fromCurrency: 'USDT',
    toCurrency: 'USD',
    rate: 1,
    source: 'manual',
    validFrom: new Date().toISOString(),
  },
];

export const useCurrencyStore = create<CurrencyState & CurrencyActions>()(
  persist(
    (set) => ({
      currencies: BUILTIN_CURRENCIES,
      rates: SEED_RATES,

      upsertRate: ({ fromCurrency, toCurrency, rate, source }) => {
        set((state) => {
          const existing = state.rates.findIndex(
            (r) => r.fromCurrency === fromCurrency && r.toCurrency === toCurrency,
          );
          const newRate: ExchangeRate = {
            fromCurrency,
            toCurrency,
            rate,
            source,
            validFrom: new Date().toISOString(),
          };
          if (existing >= 0) {
            const next = [...state.rates];
            next[existing] = newRate;
            return { rates: next };
          }
          return { rates: [...state.rates, newRate] };
        });
      },

      removeRate: (fromCurrency, toCurrency) => {
        set((state) => ({
          rates: state.rates.filter(
            (r) => !(r.fromCurrency === fromCurrency && r.toCurrency === toCurrency),
          ),
        }));
      },

      reset: () => set({ currencies: BUILTIN_CURRENCIES, rates: SEED_RATES }),
    }),
    { name: 'valbook-currency', version: 1 },
  ),
);

export function convertCurrency(
  amount: number,
  from: string,
  to: string,
  rates: ExchangeRate[],
): number | null {
  if (from === to) return amount;
  const direct = rates.find((r) => r.fromCurrency === from && r.toCurrency === to);
  if (direct) return amount * direct.rate;
  const inverse = rates.find((r) => r.fromCurrency === to && r.toCurrency === from);
  if (inverse) return amount / inverse.rate;
  // Try 2-hop via common pivot
  for (const r1 of rates.filter((r) => r.fromCurrency === from)) {
    const pivot = r1.toCurrency;
    const r2 = rates.find((r) => r.fromCurrency === pivot && r.toCurrency === to);
    if (r2) return amount * r1.rate * r2.rate;
    const r2inv = rates.find((r) => r.fromCurrency === to && r.toCurrency === pivot);
    if (r2inv) return (amount * r1.rate) / r2inv.rate;
  }
  return null;
}
