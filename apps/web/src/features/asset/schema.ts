import { z } from 'zod';

export const assetStatusEnum = z.enum(['active', 'archived', 'sold', 'lost', 'disposed']);

const numericString = z
  .string()
  .regex(/^\d+(\.\d+)?$/, 'Must be a positive number')
  .optional();

export const createAssetSchema = z.object({
  workspaceId: z.string().min(1),
  categoryId: z.string().min(1).nullable().optional(),
  ownerLabelId: z.string().min(1).nullable().optional(),
  parentAssetId: z.string().min(1).nullable().optional(),
  name: z.string().min(1).max(200),
  code: z.string().max(100).optional().nullable(),
  status: assetStatusEnum.default('active'),
  location: z.string().max(200).optional().nullable(),
  notes: z.string().max(5000).optional().nullable(),
  purchasePrice: numericString,
  purchaseCurrency: z.string().length(3).optional().nullable(),
  purchaseDate: z.string().optional().nullable(),
  currentValue: numericString,
  currentCurrency: z.string().length(3).optional().nullable(),
  customFields: z.record(z.string(), z.unknown()).default({}),
});

export const updateAssetSchema = createAssetSchema.partial().extend({
  id: z.string().min(1),
});

export type CreateAssetInput = z.infer<typeof createAssetSchema>;
export type UpdateAssetInput = z.infer<typeof updateAssetSchema>;
