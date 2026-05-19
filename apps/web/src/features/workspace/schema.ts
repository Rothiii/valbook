import { z } from 'zod';

export const workspaceSlugSchema = z
  .string()
  .min(2)
  .max(50)
  .regex(/^[a-z0-9-]+$/, 'Lowercase letters, numbers, and hyphens only');

export const createWorkspaceSchema = z.object({
  name: z.string().min(1).max(120),
  slug: workspaceSlugSchema,
  displayCurrency: z.string().length(3).default('IDR'),
  templateId: z.string().min(1).default('blank'),
});

export const updateWorkspaceSchema = z.object({
  slug: workspaceSlugSchema,
  name: z.string().min(1).max(120).optional(),
  newSlug: workspaceSlugSchema.optional(),
  displayCurrency: z.string().length(3).optional(),
});

export const deleteWorkspaceSchema = z.object({
  slug: workspaceSlugSchema,
  confirm: z.string().min(1, 'Type the workspace name to confirm'),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceSchema>;
export type DeleteWorkspaceInput = z.infer<typeof deleteWorkspaceSchema>;
