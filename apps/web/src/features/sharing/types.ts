export type ShareScope = 'workspace' | 'asset';

export type PublicShare = {
  id: string;
  workspaceId: string;
  scope: ShareScope;
  targetId: string;
  token: string;
  permission: 'view';
  expiresAt: string | null;
  createdBy: string;
  createdAt: string;
  revokedAt: string | null;
};
