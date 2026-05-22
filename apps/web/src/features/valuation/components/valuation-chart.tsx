'use client';

import { useMemo } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useConvert } from '@/src/features/currency/hooks/use-currency';
import { formatMoney, formatMoneyCompact } from '@/src/shared/utils/format';

import type { ValuationEntry } from '../types';

export type ValuationChartProps = {
  entries: ValuationEntry[];
  displayCurrency?: string;
};

export function ValuationChart({ entries, displayCurrency }: ValuationChartProps) {
  const convert = useConvert();
  const data = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(a.valuedAt).getTime() - new Date(b.valuedAt).getTime())
      .map((e) => {
        const raw = Number.parseFloat(e.value);
        const converted = displayCurrency ? convert(raw, e.currency, displayCurrency) : raw;
        return {
          date: e.valuedAt,
          value: converted ?? raw,
          currency: displayCurrency ?? e.currency,
          original: raw,
          originalCurrency: e.currency,
          missing: displayCurrency ? converted === null : false,
        };
      });
  }, [entries, displayCurrency, convert]);

  if (data.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Add at least two valuation entries to render a chart.
      </p>
    );
  }

  const hasMissing = data.some((d) => d.missing);

  return (
    <div className="space-y-2">
      {hasMissing ? (
        <p className="text-xs text-destructive">
          Missing rate for some entries — chart falls back to original currency for those points.
        </p>
      ) : null}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
            <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
            <YAxis
              stroke="var(--muted-foreground)"
              fontSize={11}
              tickFormatter={(v) => formatMoneyCompact(Number(v), data[0]?.currency)}
              width={70}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--popover)',
                border: '1px solid var(--border)',
                fontSize: 12,
              }}
              formatter={(v, _name, item) => [
                formatMoney(Number(v), item?.payload?.currency),
                'Value',
              ]}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--foreground)"
              strokeWidth={1.5}
              dot={{ r: 3, fill: 'var(--foreground)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
