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

import type { ValuationEntry } from '../types';

export type ValuationChartProps = {
  entries: ValuationEntry[];
};

export function ValuationChart({ entries }: ValuationChartProps) {
  const data = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(a.valuedAt).getTime() - new Date(b.valuedAt).getTime())
      .map((e) => ({
        date: e.valuedAt,
        value: Number.parseFloat(e.value),
        currency: e.currency,
      }));
  }, [entries]);

  if (data.length < 2) {
    return (
      <p className="text-sm text-muted-foreground">
        Add at least two valuation entries to render a chart.
      </p>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} />
          <YAxis stroke="var(--muted-foreground)" fontSize={11} />
          <Tooltip
            contentStyle={{
              background: 'var(--popover)',
              border: '1px solid var(--border)',
              fontSize: 12,
            }}
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
  );
}
