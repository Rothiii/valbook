import { z } from 'zod';

export const idSchema = z.string().min(1);

export const slugSchema = z
  .string()
  .min(2)
  .max(50)
  .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only');

export const currencyCodeSchema = z
  .string()
  .length(3)
  .regex(/^[A-Z]{3}$/, 'ISO currency code (3 uppercase letters)');

export const roleSchema = z.enum(['owner', 'editor', 'viewer']);
export type Role = z.infer<typeof roleSchema>;

export const inviteRoleSchema = z.enum(['editor', 'viewer']);
export type InviteRole = z.infer<typeof inviteRoleSchema>;

export const assetStatusSchema = z.enum(['active', 'archived', 'sold', 'lost', 'disposed']);
export type AssetStatus = z.infer<typeof assetStatusSchema>;

export const fieldTypeSchema = z.enum([
  'text',
  'number',
  'date',
  'select',
  'multi_select',
  'boolean',
  'url',
  'currency',
]);
export type FieldType = z.infer<typeof fieldTypeSchema>;

export const numericStringSchema = z.string().regex(/^\d+(\.\d+)?$/, 'Must be a positive number');

export const isoDateSchema = z.string().date();

export const cursorPaginationSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

export type CursorPagination = z.infer<typeof cursorPaginationSchema>;

export type Result<T> = { ok: true; data: T } | { ok: false; error: string };
