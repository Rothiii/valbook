# Component Catalogue

Reusable UI primitives + composite components. Path alias `@/src/shared/ui/*`.

---

## `notify` — default toast helper (sonner wrapper)

**File**: [apps/web/src/shared/lib/notify.ts](../apps/web/src/shared/lib/notify.ts)
**Use for**: every `success / error / warning / info` toast across the app. Replaces direct `import { toast } from 'sonner'`.

Thin wrapper around sonner that bakes in **per-variant position rules** + keeps the rest of sonner's API (`promise`, `loading`, `dismiss`, `custom`).

### Position rules

| Variant | Position |
|---|---|
| `success`, `info`, `message` | `top-right` |
| `error`, `warning` | `bottom-right` |

### Usage

```tsx
import { notify } from '@/src/shared/lib/notify';

notify.success('Asset created');          // top-right
notify.error('Validation failed');         // bottom-right
notify.warning('Quota almost full');       // bottom-right
notify.info('Tip: drag to reorder');       // top-right

// pass-through API
notify.promise(saveAsset(), {
  loading: 'Saving…',
  success: 'Saved',
  error: 'Failed',
});
notify.dismiss(id);
```

The global mount is still [sonner.tsx](../apps/web/src/shared/ui/sonner.tsx) in `app/layout.tsx` — position rules come from per-call options, not from the `<Toaster />`.

> Do **not** import `toast` from `'sonner'` directly in feature code. Always use `notify`.

---

## Toast (custom — imperative ref API)

**File**: [apps/web/src/shared/ui/toast.tsx](../apps/web/src/shared/ui/toast.tsx)
**Default export**: `CustomToaster` (component) + `ToasterRef` (imperative handle type)
**Deps**: `sonner`, `framer-motion`, `lucide-react`, `@/src/shared/ui/button`

Imperative-style toast notification with variants, positions, action button, dismiss callback. Animates via framer-motion. Built on top of `sonner.toast.custom`.

> ⚠️ Project already ships a default Sonner wrapper at [sonner.tsx](../apps/web/src/shared/ui/sonner.tsx) mounted in `app/layout.tsx`. `CustomToaster` mounts its **own** `<SonnerToaster />` — do not render both in the same layout. Either swap the global mount, or mount `CustomToaster` only on pages that need imperative API.

### Props

| Prop | Type | Default | Notes |
|---|---|---|---|
| `defaultPosition` | `Position` | `'bottom-right'` | Position when `show()` omits it |

### Imperative API (`ref.current.show(...)`)

| Field | Type | Default | Notes |
|---|---|---|---|
| `title` | `string?` | — | Optional bold line |
| `message` | `string` | required | Body text |
| `variant` | `'default' \| 'success' \| 'error' \| 'warning'` | `'default'` | Sets icon + border + title color |
| `duration` | `number` | `4000` | ms |
| `position` | `Position` | `defaultPosition` | Per-toast override |
| `actions` | `{ label, onClick, variant? }?` | — | Action button next to dismiss |
| `onDismiss` | `() => void?` | — | Fires when user clicks X |
| `highlightTitle` | `boolean?` | — | Force green title (meeting-style emphasis) |

`Position` = `top-left | top-center | top-right | bottom-left | bottom-center | bottom-right`

### Basic usage

```tsx
'use client';

import { useRef } from 'react';
import CustomToaster, { type ToasterRef } from '@/src/shared/ui/toast';
import { Button } from '@/src/shared/ui/button';

export function Page() {
  const toasterRef = useRef<ToasterRef>(null);

  return (
    <>
      <CustomToaster ref={toasterRef} defaultPosition="bottom-right" />
      <Button
        onClick={() =>
          toasterRef.current?.show({
            title: 'Saved',
            message: 'Asset created successfully.',
            variant: 'success',
            duration: 3000,
          })
        }
      >
        Save
      </Button>
    </>
  );
}
```

### With action button

```tsx
toasterRef.current?.show({
  title: 'Asset archived',
  message: 'Moved to archive.',
  variant: 'warning',
  actions: {
    label: 'Undo',
    onClick: () => restoreAsset(id),
    variant: 'outline',
  },
});
```

### Async flow

```tsx
toasterRef.current?.show({ message: 'Uploading…', variant: 'default' });

try {
  await upload();
  toasterRef.current?.show({
    title: 'Done',
    message: 'File uploaded.',
    variant: 'success',
    highlightTitle: true,
  });
} catch {
  toasterRef.current?.show({
    title: 'Failed',
    message: 'Try again.',
    variant: 'error',
  });
}
```

### Choosing between this and the default Sonner

| Use case | Use |
|---|---|
| Simple `toast.success("…")` style | `sonner` default + existing [sonner.tsx](../apps/web/src/shared/ui/sonner.tsx) |
| Imperative API via ref, custom layout, action button inline, framer-motion animation | `CustomToaster` |
