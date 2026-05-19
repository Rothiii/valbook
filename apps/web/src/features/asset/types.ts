export type AssetStatus = 'active' | 'archived' | 'sold' | 'lost' | 'disposed';

export type Asset = {
  id: string;
  workspaceId: string;
  parentAssetId: string | null;
  categoryId: string | null;
  ownerLabelId: string | null;
  name: string;
  code: string | null;
  status: AssetStatus;
  location: string | null;
  notes: string | null;
  purchasePrice: string | null;
  purchaseCurrency: string | null;
  purchaseDate: string | null;
  currentValue: string | null;
  currentCurrency: string | null;
  currentValueUpdatedAt: string | null;
  customFields: Record<string, unknown>;
  archivedAt: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};
