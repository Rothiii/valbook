import { z } from 'zod';

export const createCategorySchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(100),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
});

export const updateCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  icon: z.string().max(10).optional(),
  color: z.string().max(20).optional(),
});

export const deleteCategorySchema = z.object({
  id: z.string().min(1),
  reassignToCategoryId: z.string().min(1).optional(),
});

export const fieldTypeEnum = z.enum([
  'text',
  'number',
  'date',
  'select',
  'multi_select',
  'boolean',
  'url',
  'currency',
]);

export const createFieldSchema = z.object({
  categoryId: z.string().min(1),
  key: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z][a-z0-9_]*$/, 'snake_case starting with letter'),
  label: z.string().min(1).max(100),
  type: fieldTypeEnum,
  required: z.boolean().default(false),
  options: z.array(z.string().min(1)).optional(),
});

export const updateFieldSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1).max(100).optional(),
  required: z.boolean().optional(),
  options: z.array(z.string().min(1)).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
export type CreateFieldInput = z.infer<typeof createFieldSchema>;
export type UpdateFieldInput = z.infer<typeof updateFieldSchema>;
