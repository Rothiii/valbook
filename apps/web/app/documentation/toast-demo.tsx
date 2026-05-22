'use client';

import { notify } from '@/src/shared/lib/notify';
import { Button } from '@/src/shared/ui/button';

export function ToastDemo() {
  return (
    <div className="space-y-3">
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
        Rule: success / info ⇒ top-right, error / warning ⇒ bottom-right.
      </p>
    </div>
  );
}
