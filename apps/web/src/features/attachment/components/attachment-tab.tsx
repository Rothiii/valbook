'use client';

import { Download, Eye, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useSession } from '@/src/features/auth/hooks/use-session';
import { notify } from '@/src/shared/lib/notify';
import { Button } from '@/src/shared/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/src/shared/ui/dialog';
import { EmptyState } from '@/src/shared/ui/empty-state';

import { useAssetAttachments, useAttachmentActions } from '../hooks/use-attachments';
import type { Attachment } from '../types';

function isPreviewable(mime: string): boolean {
  return mime.startsWith('image/') || mime === 'application/pdf' || mime.startsWith('text/');
}

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
      notify.success(`Uploaded ${files.length} file(s)`);
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setPending(false);
    }
  }

  function handleDelete(att: Attachment) {
    if (!user) return;
    if (!confirm(`Delete "${att.fileName}"?`)) return;
    deleteAttachment({ id: att.id, actorId: user.id, actorName: user.name });
    notify.success('Attachment deleted');
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
                  className="block h-12 w-12 shrink-0 overflow-hidden border border-border"
                >
                  {/* biome-ignore lint/performance/noImgElement: data: URL thumbnail, next/image not applicable */}
                  <img
                    src={att.dataUrl}
                    alt={att.fileName}
                    className="h-full w-full object-cover"
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => isPreviewable(att.mimeType) && setPreview(att)}
                  disabled={!isPreviewable(att.mimeType)}
                  className="flex h-12 w-12 shrink-0 items-center justify-center border border-border text-xs text-muted-foreground disabled:cursor-default"
                >
                  {att.mimeType.includes('pdf') ? 'PDF' : 'FILE'}
                </button>
              )}
              <div className="flex-1 min-w-0">
                <p className="truncate">{att.fileName}</p>
                <p className="text-xs text-muted-foreground">
                  {formatBytes(att.sizeBytes)} · {att.uploadedByName} ·{' '}
                  {new Date(att.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-1">
                {isPreviewable(att.mimeType) ? (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setPreview(att)}
                    aria-label="Preview"
                    className="text-foreground"
                  >
                    <Eye />
                  </Button>
                ) : null}
                <Button
                  asChild
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Download"
                  className="text-foreground"
                >
                  <a href={att.dataUrl} download={att.fileName}>
                    <Download />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(att)}
                  aria-label="Delete"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive dark:hover:bg-destructive/20"
                >
                  <Trash2 />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="h-[85vh] max-w-4xl p-0">
          {preview ? (
            <>
              <DialogHeader className="border-b border-border px-4 py-3">
                <DialogTitle className="truncate text-sm">{preview.fileName}</DialogTitle>
                <DialogDescription className="text-xs">
                  {preview.mimeType} · {formatBytes(preview.sizeBytes)}
                </DialogDescription>
              </DialogHeader>
              <div className="flex-1 overflow-auto bg-muted/30">
                <PreviewBody attachment={preview} />
              </div>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PreviewBody({ attachment }: { attachment: Attachment }) {
  if (attachment.mimeType.startsWith('image/')) {
    return (
      // biome-ignore lint/performance/noImgElement: data: URL, next/image not applicable
      <img
        src={attachment.dataUrl}
        alt={attachment.fileName}
        className="mx-auto max-h-full max-w-full object-contain"
      />
    );
  }
  if (attachment.mimeType === 'application/pdf' || attachment.mimeType.startsWith('text/')) {
    return (
      <iframe
        src={attachment.dataUrl}
        title={attachment.fileName}
        className="h-full w-full border-0"
      />
    );
  }
  return (
    <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
      No inline preview for this file type.
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
