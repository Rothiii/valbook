'use client';

import { useState } from 'react';
import type { Asset } from '@/src/features/asset/types';
import { useSession } from '@/src/features/auth/hooks/use-session';
import { notify } from '@/src/shared/lib/notify';
import { Button } from '@/src/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/shared/ui/dialog';
import { EmptyState } from '@/src/shared/ui/empty-state';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table';
import { formatMoney } from '@/src/shared/utils/format';

import { useAssetValuations, useValuationActions } from '../hooks/use-valuations';
import { ValuationChart } from './valuation-chart';
import { ValuationForm } from './valuation-form';

export type ValuationTabProps = {
  asset: Asset;
  defaultCurrency: string;
  displayCurrency?: string;
};

export function ValuationTab({ asset, defaultCurrency, displayCurrency }: ValuationTabProps) {
  const entries = useAssetValuations(asset.id);
  const { deleteValuation } = useValuationActions();
  const { user } = useSession();
  const [open, setOpen] = useState(false);
  const [convertChart, setConvertChart] = useState(false);

  function handleDelete(id: string) {
    if (!user) return;
    if (!confirm('Delete this valuation entry?')) return;
    deleteValuation({ id, actorId: user.id, actorName: user.name });
    notify.success('Valuation deleted');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{entries.length} entries</p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>+ Add entry</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add valuation</DialogTitle>
            </DialogHeader>
            <ValuationForm
              assetId={asset.id}
              workspaceId={asset.workspaceId}
              assetName={asset.name}
              defaultCurrency={defaultCurrency}
              onSuccess={() => setOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title="No valuations yet"
          description="Track value changes over time. Each entry has a date, amount, and currency."
          action={<Button onClick={() => setOpen(true)}>+ Add entry</Button>}
        />
      ) : (
        <>
          {displayCurrency && displayCurrency !== asset.currentCurrency ? (
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input
                type="checkbox"
                checked={convertChart}
                onChange={(e) => setConvertChart(e.target.checked)}
              />
              Convert chart to {displayCurrency}
            </label>
          ) : null}
          <ValuationChart
            entries={entries}
            displayCurrency={convertChart ? displayCurrency : undefined}
          />
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Note</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((e) => (
                <TableRow key={e.id}>
                  <TableCell>{e.valuedAt}</TableCell>
                  <TableCell>{formatMoney(e.value, e.currency)}</TableCell>
                  <TableCell className="text-muted-foreground">{e.source}</TableCell>
                  <TableCell className="text-muted-foreground">{e.note ?? '—'}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}>
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </>
      )}
    </div>
  );
}
