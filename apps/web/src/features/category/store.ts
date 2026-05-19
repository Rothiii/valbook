'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useActivityStore } from '@/src/features/activity/store';

import type { CreateCategoryInput, DeleteCategoryInput, UpdateCategoryInput } from './schema';
import type { Category, CategoryField } from './types';

type CategoryState = {
  categories: Category[];
  fields: Record<string, CategoryField[]>; // categoryId -> fields
};

type CategoryActions = {
  createCategory: (input: CreateCategoryInput & { actorId: string; actorName: string }) => Category;
  updateCategory: (input: UpdateCategoryInput & { actorId: string; actorName: string }) => void;
  deleteCategory: (
    input: DeleteCategoryInput & { actorId: string; actorName: string; workspaceId: string },
  ) => void;
  seedCategories: (
    workspaceId: string,
    presets: Array<{ name: string; icon?: string; color?: string }>,
  ) => void;
  reset: () => void;
};

const initialState: CategoryState = {
  categories: [],
  fields: {},
};

function uuid(): string {
  return crypto.randomUUID();
}

function nowIso(): string {
  return new Date().toISOString();
}

export const useCategoryStore = create<CategoryState & CategoryActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      createCategory: ({ workspaceId, name, icon, color, actorId, actorName }) => {
        const id = uuid();
        const now = nowIso();
        const category: Category = {
          id,
          workspaceId,
          name,
          icon,
          color,
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          categories: [...state.categories, category],
          fields: { ...state.fields, [id]: [] },
        }));
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'category',
          entityId: id,
          entityLabel: name,
          action: 'create',
          diff: { snapshot: category },
        });
        return category;
      },

      updateCategory: ({ id, name, icon, color, actorId, actorName }) => {
        const before = get().categories.find((c) => c.id === id);
        if (!before) return;
        const after: Category = {
          ...before,
          name: name ?? before.name,
          icon: icon ?? before.icon,
          color: color ?? before.color,
          updatedAt: nowIso(),
        };
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? after : c)),
        }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'category',
          entityId: id,
          entityLabel: after.name,
          action: 'update',
          diff: { before, after },
        });
      },

      deleteCategory: ({ id, workspaceId, actorId, actorName }) => {
        const before = get().categories.find((c) => c.id === id);
        if (!before) return;
        set((state) => {
          const nextFields = { ...state.fields };
          delete nextFields[id];
          return {
            categories: state.categories.filter((c) => c.id !== id),
            fields: nextFields,
          };
        });
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'category',
          entityId: id,
          entityLabel: before.name,
          action: 'delete',
          diff: { before },
        });
      },

      seedCategories: (workspaceId, presets) => {
        const now = nowIso();
        const newCategories = presets.map((p) => ({
          id: uuid(),
          workspaceId,
          name: p.name,
          icon: p.icon,
          color: p.color,
          createdAt: now,
          updatedAt: now,
        }));
        const newFields: Record<string, CategoryField[]> = {};
        for (const c of newCategories) {
          newFields[c.id] = [];
        }
        set((state) => ({
          categories: [...state.categories, ...newCategories],
          fields: { ...state.fields, ...newFields },
        }));
      },

      reset: () => set(initialState),
    }),
    {
      name: 'valbook-category',
      version: 1,
    },
  ),
);
