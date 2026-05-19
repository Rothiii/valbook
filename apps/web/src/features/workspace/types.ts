export type WorkspaceRole = 'owner' | 'editor' | 'viewer';

export type Workspace = {
  id: string;
  slug: string;
  name: string;
  displayCurrency: string;
  ownerId: string;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type WorkspaceMember = {
  id: string;
  workspaceId: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: WorkspaceRole;
  joinedAt: string;
};

export type WorkspaceInvitation = {
  id: string;
  workspaceId: string;
  email: string;
  role: Exclude<WorkspaceRole, 'owner'>;
  token: string;
  invitedBy: string;
  expiresAt: string;
  acceptedAt: string | null;
};

export type WorkspaceTemplateFieldType =
  | 'text'
  | 'number'
  | 'date'
  | 'select'
  | 'multi_select'
  | 'boolean'
  | 'url'
  | 'currency';

export type WorkspaceTemplateField = {
  key: string;
  label: string;
  type: WorkspaceTemplateFieldType;
  required: boolean;
  options?: string[];
};

export type WorkspaceTemplateCategory = {
  name: string;
  icon?: string;
  color?: string;
  fields: WorkspaceTemplateField[];
};

export type WorkspaceTemplate = {
  id: string;
  name: string;
  description: string;
  icon: string;
  isBuiltin: boolean;
  definition: {
    categories: WorkspaceTemplateCategory[];
  };
};
