'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useActivityStore } from '@/src/features/activity/store';

import type {
  CreateCategoryInput,
  CreateFieldInput,
  DeleteCategoryInput,
  UpdateCategoryInput,
  UpdateFieldInput,
} from './schema';
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
    presets: Array<{
      name: string;
      icon?: string;
      color?: string;
      fields?: Array<{
        key: string;
        label: string;
        type: CategoryField['type'];
        required: boolean;
        options?: string[];
      }>;
    }>,
  ) => void;
  createField: (
    input: CreateFieldInput & { workspaceId: string; actorId: string; actorName: string },
  ) => CategoryField;
  updateField: (
    input: UpdateFieldInput & { workspaceId: string; actorId: string; actorName: string },
  ) => void;
  deleteField: (input: {
    id: string;
    workspaceId: string;
    actorId: string;
    actorName: string;
  }) => void;
  reorderFields: (input: {
    categoryId: string;
    orderedIds: string[];
    workspaceId: string;
    actorId: string;
    actorName: string;
  }) => void;
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
        const newCategories: Category[] = presets.map((p) => ({
          id: uuid(),
          workspaceId,
          name: p.name,
          icon: p.icon,
          color: p.color,
          createdAt: now,
          updatedAt: now,
        }));
        const newFields: Record<string, CategoryField[]> = {};
        presets.forEach((preset, index) => {
          const category = newCategories[index];
          if (!category) return;
          newFields[category.id] = (preset.fields ?? []).map((f, fIdx) => ({
            id: uuid(),
            categoryId: category.id,
            key: f.key,
            label: f.label,
            type: f.type,
            required: f.required,
            options: f.options,
            sortOrder: fIdx,
          }));
        });
        set((state) => ({
          categories: [...state.categories, ...newCategories],
          fields: { ...state.fields, ...newFields },
        }));
      },

      createField: ({
        categoryId,
        key,
        label,
        type,
        required,
        options,
        workspaceId,
        actorId,
        actorName,
      }) => {
        const existing = get().fields[categoryId] ?? [];
        if (existing.some((f) => f.key === key)) {
          throw new Error(`Field key "${key}" already exists for this category`);
        }
        const field: CategoryField = {
          id: uuid(),
          categoryId,
          key,
          label,
          type,
          required: required ?? false,
          options,
          sortOrder: existing.length,
        };
        set((state) => ({
          fields: { ...state.fields, [categoryId]: [...existing, field] },
        }));
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'field',
          entityId: field.id,
          entityLabel: field.label,
          action: 'create',
          diff: { snapshot: field },
        });
        return field;
      },

      updateField: ({ id, label, required, options, workspaceId, actorId, actorName }) => {
        let before: CategoryField | null = null;
        let after: CategoryField | null = null;
        set((state) => {
          const next: Record<string, CategoryField[]> = {};
          for (const [catId, list] of Object.entries(state.fields)) {
            next[catId] = list.map((f) => {
              if (f.id !== id) return f;
              before = f;
              const updated: CategoryField = {
                ...f,
                label: label ?? f.label,
                required: required ?? f.required,
                options: options ?? f.options,
              };
              after = updated;
              return updated;
            });
          }
          return { fields: next };
        });
        if (before && after) {
          useActivityStore.getState().writeActivity({
            workspaceId,
            actorId,
            actorName,
            entityType: 'field',
            entityId: id,
            entityLabel: (after as CategoryField).label,
            action: 'update',
            diff: { before, after },
          });
        }
      },

      deleteField: ({ id, workspaceId, actorId, actorName }) => {
        let removed: CategoryField | null = null;
        set((state) => {
          const next: Record<string, CategoryField[]> = {};
          for (const [catId, list] of Object.entries(state.fields)) {
            const filtered = list.filter((f) => {
              if (f.id === id) {
                removed = f;
                return false;
              }
              return true;
            });
            next[catId] = filtered.map((f, idx) => ({ ...f, sortOrder: idx }));
          }
          return { fields: next };
        });
        if (removed) {
          useActivityStore.getState().writeActivity({
            workspaceId,
            actorId,
            actorName,
            entityType: 'field',
            entityId: id,
            entityLabel: (removed as CategoryField).label,
            action: 'delete',
            diff: { before: removed },
          });
        }
      },

      reorderFields: ({ categoryId, orderedIds, workspaceId, actorId, actorName }) => {
        const current = get().fields[categoryId] ?? [];
        const map = new Map(current.map((f) => [f.id, f]));
        const reordered: CategoryField[] = [];
        orderedIds.forEach((id, idx) => {
          const f = map.get(id);
          if (f) reordered.push({ ...f, sortOrder: idx });
        });
        set((state) => ({ fields: { ...state.fields, [categoryId]: reordered } }));
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'field',
          entityId: categoryId,
          action: 'update',
          diff: { reordered: orderedIds },
        });
      },

      reset: () => set(initialState),
    }),
    {
      name: 'valbook-category',
      version: 1,
    },
  ),
);
