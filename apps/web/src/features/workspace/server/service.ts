import { and, eq } from 'drizzle-orm';

import { activityLogs } from '@/src/features/activity/server/db';
import { categories, categoryFields } from '@/src/features/category/server/db';
import { db } from '@/src/server/db';
import type { CreateWorkspaceInput } from '../schema';
import { BUILTIN_TEMPLATES } from '../templates';
import { workspaceInvitations, workspaceMembers, workspaces } from './db';

function uuid(): string {
  return crypto.randomUUID();
}

export type CreateWorkspaceContext = {
  ownerUserId: string;
  ownerName: string;
};

export async function createWorkspaceWithTemplate(
  input: CreateWorkspaceInput,
  ctx: CreateWorkspaceContext,
) {
  return await db.transaction(async (tx) => {
    const workspaceId = uuid();
    const memberId = uuid();
    const now = new Date();

    const [workspace] = await tx
      .insert(workspaces)
      .values({
        id: workspaceId,
        name: input.name,
        slug: input.slug,
        ownerId: ctx.ownerUserId,
        displayCurrency: input.displayCurrency.toUpperCase(),
        settings: { templateId: input.templateId },
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    await tx.insert(workspaceMembers).values({
      id: memberId,
      workspaceId,
      userId: ctx.ownerUserId,
      role: 'owner',
      joinedAt: now,
    });

    // Materialize template categories + fields
    const template = BUILTIN_TEMPLATES.find((t) => t.id === input.templateId);
    if (template && template.definition.categories.length > 0) {
      for (const cat of template.definition.categories) {
        const categoryId = uuid();
        await tx.insert(categories).values({
          id: categoryId,
          workspaceId,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          createdAt: now,
          updatedAt: now,
        });
        if (cat.fields && cat.fields.length > 0) {
          await tx.insert(categoryFields).values(
            cat.fields.map((f, idx) => ({
              id: uuid(),
              categoryId,
              key: f.key,
              label: f.label,
              type: f.type,
              required: f.required,
              options: f.options ?? null,
              sortOrder: idx,
              createdAt: now,
            })),
          );
        }
      }
    }

    await tx.insert(activityLogs).values({
      id: uuid(),
      workspaceId,
      actorId: ctx.ownerUserId,
      entityType: 'workspace',
      entityId: workspaceId,
      entityLabel: input.name,
      action: 'create',
      diff: { snapshot: workspace },
      createdAt: now,
    });

    return workspace;
  });
}

export async function listWorkspacesForUser(userId: string) {
  const rows = await db
    .select({ workspace: workspaces, role: workspaceMembers.role })
    .from(workspaceMembers)
    .innerJoin(workspaces, eq(workspaces.id, workspaceMembers.workspaceId))
    .where(eq(workspaceMembers.userId, userId));
  return rows.map((r) => ({ ...r.workspace, role: r.role }));
}

export async function getWorkspaceMembership(slug: string, userId: string) {
  const rows = await db
    .select({ workspace: workspaces, member: workspaceMembers })
    .from(workspaces)
    .innerJoin(
      workspaceMembers,
      and(eq(workspaceMembers.workspaceId, workspaces.id), eq(workspaceMembers.userId, userId)),
    )
    .where(eq(workspaces.slug, slug))
    .limit(1);
  return rows[0] ?? null;
}

export async function updateWorkspace(
  workspaceId: string,
  patch: { name?: string; slug?: string; displayCurrency?: string },
  actorId: string,
) {
  const before = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (before.length === 0) {
    throw new Error('Workspace not found');
  }
  const now = new Date();
  const [after] = await db
    .update(workspaces)
    .set({
      name: patch.name ?? undefined,
      slug: patch.slug ?? undefined,
      displayCurrency: patch.displayCurrency ? patch.displayCurrency.toUpperCase() : undefined,
      updatedAt: now,
    })
    .where(eq(workspaces.id, workspaceId))
    .returning();

  await db.insert(activityLogs).values({
    id: uuid(),
    workspaceId,
    actorId,
    entityType: 'workspace',
    entityId: workspaceId,
    entityLabel: after?.name,
    action: 'update',
    diff: { before: before[0], after },
    createdAt: now,
  });

  return after;
}

export async function deleteWorkspace(workspaceId: string, actorId: string) {
  const before = await db.select().from(workspaces).where(eq(workspaces.id, workspaceId)).limit(1);
  if (before.length === 0) {
    throw new Error('Workspace not found');
  }
  await db.insert(activityLogs).values({
    id: uuid(),
    workspaceId,
    actorId,
    entityType: 'workspace',
    entityId: workspaceId,
    entityLabel: before[0]?.name,
    action: 'delete',
    diff: { before: before[0] },
    createdAt: new Date(),
  });
  await db.delete(workspaces).where(eq(workspaces.id, workspaceId));
  return { ok: true };
}

// Avoid unused import lint warnings for tables only used by router
export { workspaceInvitations };
