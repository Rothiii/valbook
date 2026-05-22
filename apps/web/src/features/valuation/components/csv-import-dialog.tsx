'use client';

import Papa from 'papaparse';
import { useState } from 'react';
import { useAssets } from '@/src/features/asset/hooks/use-assets';
import { useSession } from '@/src/features/auth/hooks/use-session';
import { notify } from '@/src/shared/lib/notify';
import { Button } from '@/src/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/shared/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/shared/ui/table';

import { useValuationActions } from '../hooks/use-valuations';

type RawRow = {
  asset_code?: string;
  value?: string;
  currency?: string;
  valued_at?: string;
  note?: string;
};

type ParsedRow = {
  index: number;
  raw: RawRow;
  assetId?: string;
  status: 'ok' | 'error';
  error?: string;
};

export type CsvImportDialogProps = {
  workspaceId: string;
};

export function CsvImportDialog({ workspaceId }: CsvImportDialogProps) {
  const { user } = useSession();
  const assets = useAssets(workspaceId, { includeArchived: true });
  const { bulkImport } = useValuationActions();
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    Papa.parse<RawRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed: ParsedRow[] = results.data.map((raw, idx) => {
          const code = raw.asset_code?.trim();
          const asset = code ? assets.find((a) => a.code === code) : undefined;
          const value = raw.value?.trim();
          const currency = raw.currency?.trim()?.toUpperCase();
          const valuedAt = raw.valued_at?.trim();
          if (!code) {
            return { index: idx + 1, raw, status: 'error', error: 'Missing asset_code' };
          }
          if (!asset) {
            return {
              index: idx + 1,
              raw,
              status: 'error',
              error: `Asset code "${code}" not found`,
            };
          }
          if (!value || !/^\d+(\.\d+)?$/.test(value)) {
            return { index: idx + 1, raw, status: 'error', error: 'Invalid value' };
          }
          if (!currency || currency.length !== 3) {
            return {
              index: idx + 1,
              raw,
              status: 'error',
              error: 'Invalid currency (3-letter code)',
            };
          }
          if (!valuedAt || Number.isNaN(new Date(valuedAt).getTime())) {
            return { index: idx + 1, raw, status: 'error', error: 'Invalid valued_at' };
          }
          return { index: idx + 1, raw, assetId: asset.id, status: 'ok' };
        });
        setRows(parsed);
      },
    });
  }

  function confirmImport() {
    if (!user) return;
    const validRows = rows.filter((r) => r.status === 'ok');
    if (validRows.length === 0) {
      notify.error('No valid rows to import');
      return;
    }
    const { insertedCount } = bulkImport({
      workspaceId,
      rows: validRows.map((r) => ({
        assetId: r.assetId as string,
        workspaceId,
        value: r.raw.value?.trim() ?? '',
        currency: (r.raw.currency?.trim() ?? '').toUpperCase(),
        valuedAt: r.raw.valued_at?.trim() ?? '',
        note: r.raw.note?.trim() || null,
        customFields: {},
        createdBy: user.id,
      })),
      actorId: user.id,
      actorName: user.name,
    });
    notify.success(`Imported ${insertedCount} valuation entries`);
    setOpen(false);
    setRows([]);
  }

  const okCount = rows.filter((r) => r.status === 'ok').length;
  const errCount = rows.length - okCount;

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) setRows([]);
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline">📥 Import CSV</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import valuations from CSV</DialogTitle>
          <DialogDescription>
            Required columns: <code>asset_code, value, currency, valued_at, note</code>
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFile}
            className="block w-full border border-border bg-background p-2 text-sm"
          />
          {rows.length > 0 ? (
            <>
              <p className="text-sm">
                {rows.length} rows · <span className="text-foreground">{okCount} valid</span> ·{' '}
                <span className="text-destructive">{errCount} errors</span>
              </p>
              <div className="max-h-64 overflow-y-auto border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Currency</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((r) => (
                      <TableRow key={r.index}>
                        <TableCell className="text-muted-foreground">{r.index}</TableCell>
                        <TableCell>{r.raw.asset_code ?? '—'}</TableCell>
                        <TableCell>{r.raw.value ?? '—'}</TableCell>
                        <TableCell>{r.raw.currency ?? '—'}</TableCell>
                        <TableCell>{r.raw.valued_at ?? '—'}</TableCell>
                        <TableCell
                          className={r.status === 'error' ? 'text-destructive' : 'text-foreground'}
                        >
                          {r.status === 'ok' ? '✓ ok' : `✗ ${r.error}`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirmImport} disabled={okCount === 0}>
            Import {okCount} valid rows
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
