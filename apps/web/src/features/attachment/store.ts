'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import { useActivityStore } from '@/src/features/activity/store';

import type { Attachment } from './types';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB cap for in-memory slicing

const ALLOWED_MIME = new Set<string>([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'application/pdf',
  'text/csv',
  'text/plain',
]);

type AttachmentState = {
  attachments: Attachment[];
};

type AttachmentActions = {
  uploadFile: (input: {
    workspaceId: string;
    assetId: string | null;
    file: File;
    actorId: string;
    actorName: string;
  }) => Promise<Attachment>;
  deleteAttachment: (input: { id: string; actorId: string; actorName: string }) => void;
  reset: () => void;
};

function uuid(): string {
  return crypto.randomUUID();
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

export const useAttachmentStore = create<AttachmentState & AttachmentActions>()(
  persist(
    (set, get) => ({
      attachments: [],

      uploadFile: async ({ workspaceId, assetId, file, actorId, actorName }) => {
        if (file.size > MAX_FILE_SIZE_BYTES) {
          throw new Error(`File too large (max ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB)`);
        }
        if (!ALLOWED_MIME.has(file.type)) {
          throw new Error(`File type not allowed: ${file.type || 'unknown'}`);
        }
        const dataUrl = await readAsDataUrl(file);
        const attachment: Attachment = {
          id: uuid(),
          workspaceId,
          assetId,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          dataUrl,
          uploadedBy: actorId,
          uploadedByName: actorName,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ attachments: [...state.attachments, attachment] }));
        useActivityStore.getState().writeActivity({
          workspaceId,
          actorId,
          actorName,
          entityType: 'attachment',
          entityId: attachment.id,
          entityLabel: file.name,
          action: 'upload',
        });
        return attachment;
      },

      deleteAttachment: ({ id, actorId, actorName }) => {
        const before = get().attachments.find((a) => a.id === id);
        if (!before) return;
        set((state) => ({ attachments: state.attachments.filter((a) => a.id !== id) }));
        useActivityStore.getState().writeActivity({
          workspaceId: before.workspaceId,
          actorId,
          actorName,
          entityType: 'attachment',
          entityId: id,
          entityLabel: before.fileName,
          action: 'delete',
        });
      },

      reset: () => set({ attachments: [] }),
    }),
    { name: 'valbook-attachment', version: 1 },
  ),
);

export { ALLOWED_MIME, MAX_FILE_SIZE_BYTES };
