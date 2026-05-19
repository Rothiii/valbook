'use client';

import { useCategoryStore } from '../store';

export function useCategories(workspaceId: string | null | undefined) {
  return useCategoryStore((s) =>
    workspaceId ? s.categories.filter((c) => c.workspaceId === workspaceId) : [],
  );
}

export function useCategory(id: string | null | undefined) {
  return useCategoryStore((s) => (id ? (s.categories.find((c) => c.id === id) ?? null) : null));
}

export function useCategoryActions() {
  return useCategoryStore((s) => ({
    createCategory: s.createCategory,
    updateCategory: s.updateCategory,
    deleteCategory: s.deleteCategory,
    seedCategories: s.seedCategories,
  }));
}
