export type CategoryFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multi_select'
  | 'boolean'
  | 'url'
  | 'currency';

export type CategoryField = {
  id: string;
  categoryId: string;
  key: string;
  label: string;
  type: CategoryFieldType;
  required: boolean;
  options?: string[];
  sortOrder: number;
};

export type Category = {
  id: string;
  workspaceId: string;
  name: string;
  icon?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
};
