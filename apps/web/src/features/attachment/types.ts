export type Attachment = {
  id: string;
  workspaceId: string;
  assetId: string | null;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string; // base64 data URL for slicing mode
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
};
