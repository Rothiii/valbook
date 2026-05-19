import { z } from 'zod';

export const createOwnerLabelSchema = z.object({
  workspaceId: z.string().min(1),
  name: z.string().min(1).max(100),
  color: z.string().max(20).optional(),
});

export const updateOwnerLabelSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100).optional(),
  color: z.string().max(20).optional(),
});

export type CreateOwnerLabelInput = z.infer<typeof createOwnerLabelSchema>;
export type UpdateOwnerLabelInput = z.infer<typeof updateOwnerLabelSchema>;
