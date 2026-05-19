'use client';

import { useShallow } from 'zustand/react/shallow';

import { useCategoryStore } from '../store';
import type { CategoryField } from '../types';

const EMPTY_FIELDS: CategoryField[] = [];

export function useCategoryFields(categoryId: string | null | undefined) {
  return useCategoryStore(
    useShallow((s) => (categoryId ? (s.fields[categoryId] ?? EMPTY_FIELDS) : EMPTY_FIELDS)),
  );
}

export function useFieldActions() {
  return useCategoryStore(
    useShallow((s) => ({
      createField: s.createField,
      updateField: s.updateField,
      deleteField: s.deleteField,
      reorderFields: s.reorderFields,
    })),
  );
}
