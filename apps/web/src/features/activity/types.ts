export type ActivityEntityType =
  | 'workspace'
  | 'asset'
  | 'category'
  | 'field'
  | 'owner_label'
  | 'tag'
  | 'member'
  | 'invitation'
  | 'valuation'
  | 'attachment'
  | 'share';

export type ActivityAction =
  | 'create'
  | 'update'
  | 'delete'
  | 'archive'
  | 'unarchive'
  | 'reparent'
  | 'bulk_import'
  | 'invite'
  | 'accept'
  | 'role_change'
  | 'remove'
  | 'leave'
  | 'upload'
  | 'revoke'
  | 'transfer';

export type ActivityLog = {
  id: string;
  workspaceId: string;
  actorId: string;
  actorName: string;
  entityType: ActivityEntityType;
  entityId: string;
  entityLabel?: string;
  action: ActivityAction;
  diff?: Record<string, unknown> | null;
  createdAt: string;
};
