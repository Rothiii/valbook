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

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type DeleteCategoryInput = z.infer<typeof deleteCategorySchema>;
