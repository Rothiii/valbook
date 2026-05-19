'use client';

import { useShallow } from 'zustand/react/shallow';

import { useAttachmentStore } from '../store';
import type { Attachment } from '../types';

const EMPTY: Attachment[] = [];

export function useAssetAttachments(assetId: string | null | undefined) {
  return useAttachmentStore(
    useShallow((s) => (assetId ? s.attachments.filter((a) => a.assetId === assetId) : EMPTY)),
  );
}

export function useAttachmentActions() {
  return useAttachmentStore(
    useShallow((s) => ({
      uploadFile: s.uploadFile,
      deleteAttachment: s.deleteAttachment,
    })),
  );
}
