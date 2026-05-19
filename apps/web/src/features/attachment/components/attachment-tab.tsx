'use client';

import { useState } from 'react';
import { toast } from 'sonner';

import { useSession } from '@/src/features/auth/hooks/use-session';
import { Button } from '@/src/shared/ui/button';
import { EmptyState } from '@/src/shared/ui/empty-state';

import { useAssetAttachments, useAttachmentActions } from '../hooks/use-attachments';
import type { Attachment } from '../types';

export type AttachmentTabProps = {
  assetId: string;
  workspaceId: string;
};

export function AttachmentTab({ assetId, workspaceId }: AttachmentTabProps) {
  const attachments = useAssetAttachments(assetId);
  const { user } = useSession();
  const { uploadFile, deleteAttachment } = useAttachmentActions();
  const [pending, setPending] = useState(false);
  const [preview, setPreview] = useState<Attachment | null>(null);

  async function handleUpload(files: FileList | null) {
    if (!user || !files) return;
    setPending(true);
    try {
      for (const file of Array.from(files)) {
        await uploadFile({
          workspaceId,
          assetId,
          file,
          actorId: user.id,
          actorName: user.name,
        });
      }
      toast.success(`Uploaded ${files.length} file(s)`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setPending(false);
    }
  }

  function handleDelete(att: Attachment) {
    if (!user) return;
    if (!confirm(`Delete "${att.fileName}"?`)) return;
    deleteAttachment({ id: att.id, actorId: user.id, actorName: user.name });
    toast.success('Attachment deleted');
  }

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center gap-3 border border-dashed border-border bg-muted/30 p-4 text-sm">
        <input
          type="file"
          multiple
          className="hidden"
          accept="image/*,application/pdf,text/csv,text/plain"
          onChange={(e) => handleUpload(e.target.files)}
        />
        <span className="text-muted-foreground">
          {pending ? 'Uploading…' : 'Click to upload (max 5MB per file)'}
        </span>
      </label>

      {attachments.length === 0 ? (
        <EmptyState
          title="No attachments yet"
          description="Upload photos, invoices, certificates, or other documents."
        />
      ) : (
        <ul className="divide-y divide-border border border-border">
          {attachments.map((att) => (
            <li key={att.id} className="flex items-center gap-3 px-3 py-2 text-sm">
              {att.mimeType.startsWith('image/') ? (
                <button
                  type="button"
                  onClick={() => setPreview(att)}
                  className="block h-12 w-12 flex-shrink-0 overflow-hidden border border-border"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={att.dataUrl}
                    alt={att.fileName}
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center border border-border text-xs text-muted-foreground">
                  {att.mimeType.includes('pdf') ? 'PDF' : 'FILE'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate">{att.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(att.sizeBytes)} · {att.uploadedByName} ·{' '}
                  {new Date(att.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1">
                <Button asChild variant="ghost" size="sm">
                  <a href={att.dataUrl} download={att.fileName}>
                    Download
                  </a>
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(att)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {preview ? (
        <button
          type="button"
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/80 p-6"
          onClick={() => setPreview(null)}
          aria-label="Close preview"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview.dataUrl}
            alt={preview.fileName}
            className="max-h-full max-w-full border border-border bg-background"
          />
        </button>
      ) : null}
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
