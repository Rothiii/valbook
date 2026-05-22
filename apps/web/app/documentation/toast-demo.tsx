'use client';

import { notify } from '@/src/shared/lib/notify';
import { Button } from '@/src/shared/ui/button';

export function ToastDemo() {
  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Variants · close button + progress bar built-in
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              notify.message('Default toast', {
                description: 'Top-right · neutral info',
              })
            }
          >
            Default
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              notify.success('Success toast', {
                description: 'Top-right · positive confirmation',
              })
            }
          >
            Success
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              notify.error('Error toast', {
                description: 'Bottom-right · failure signal',
              })
            }
          >
            Error
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              notify.warning('Warning toast', {
                description: 'Bottom-right · caution',
              })
            }
          >
            Warning
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Rule: success / info ⇒ top-right, error / warning ⇒ bottom-right. Every toast has an X
          close button + 4s progress bar at the bottom.
        </p>
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Actions · Undo / Cancel
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() =>
              notify.success('Asset archived', {
                description: 'Moved to archive',
                action: {
                  label: 'Undo',
                  onClick: () => notify.info('Asset restored'),
                },
              })
            }
          >
            With Undo
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              notify.warning('Delete workspace?', {
                description: 'This cannot be undone',
                action: {
                  label: 'Confirm',
                  onClick: () => notify.error('Workspace deleted'),
                },
                cancel: {
                  label: 'Cancel',
                  onClick: () => {},
                },
              })
            }
          >
            Confirm + Cancel
          </Button>
        </div>
      </div>

      <div className="space-y-3 border-t border-border pt-6">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">
          Loading · spinner + promise flow
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              const id = notify.loading('Uploading file…', {
                description: 'Please wait',
              });
              setTimeout(() => notify.dismiss(id), 2500);
            }}
          >
            Loading spinner
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              notify.promise(
                new Promise<string>((resolve) => setTimeout(() => resolve('asset_123'), 2000)),
                {
                  loading: 'Saving asset…',
                  success: (id) => `Saved as ${id}`,
                  error: 'Save failed',
                },
              )
            }
          >
            Promise (loading → success)
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              notify.promise(
                new Promise<never>((_, reject) =>
                  setTimeout(() => reject(new Error('Network')), 2000),
                ),
                {
                  loading: 'Syncing…',
                  success: 'Done',
                  error: 'Sync failed',
                },
              )
            }
          >
            Promise (loading → error)
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Loading toasts skip the progress bar; promise auto-swaps to success/error on settle.
        </p>
      </div>
    </div>
  );
}
