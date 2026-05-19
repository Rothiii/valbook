export type ValuationSource = 'manual' | 'import' | 'market';

export type ValuationEntry = {
  id: string;
  assetId: string;
  workspaceId: string;
  value: string;
  currency: string;
  valuedAt: string;
  source: ValuationSource;
  note: string | null;
  customFields: Record<string, unknown>;
  createdBy: string;
  createdAt: string;
};
