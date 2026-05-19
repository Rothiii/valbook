import { z } from 'zod';

export const valuationSourceEnum = z.enum(['manual', 'import', 'market']);

const numericString = z.string().regex(/^\d+(\.\d+)?$/, 'Must be a positive number');

export const createValuationSchema = z.object({
  assetId: z.string().min(1),
  value: numericString,
  currency: z.string().length(3),
  valuedAt: z.string().min(1),
  note: z.string().max(500).nullable().optional(),
  source: valuationSourceEnum.default('manual'),
});

export const updateValuationSchema = z.object({
  id: z.string().min(1),
  value: numericString.optional(),
  currency: z.string().length(3).optional(),
  valuedAt: z.string().min(1).optional(),
  note: z.string().max(500).nullable().optional(),
});

export type CreateValuationInput = z.infer<typeof createValuationSchema>;
export type UpdateValuationInput = z.infer<typeof updateValuationSchema>;
