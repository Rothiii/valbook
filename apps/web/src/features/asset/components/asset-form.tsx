'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useSession } from '@/src/features/auth/hooks/use-session';
import { DynamicFields } from '@/src/features/category/components/dynamic-fields';
import { useCategories } from '@/src/features/category/hooks/use-categories';
import { useCategoryFields } from '@/src/features/category/hooks/use-fields';
import { useOwnerLabels } from '@/src/features/owner-label/hooks/use-owner-labels';
import { useAssetTagIds, useTagActions, useTags } from '@/src/features/tag/hooks/use-tags';
import type { Workspace } from '@/src/features/workspace/types';
import { Button } from '@/src/shared/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/shared/ui/form';
import { Input } from '@/src/shared/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select';
import { Textarea } from '@/src/shared/ui/textarea';

import { useAssetActions, useAssets } from '../hooks/use-assets';
import { type CreateAssetInput, createAssetSchema } from '../schema';
import type { Asset } from '../types';

export type AssetFormProps = {
  workspace: Workspace;
  asset?: Asset | null;
};

export function AssetForm({ workspace, asset }: AssetFormProps) {
  const router = useRouter();
  const { user } = useSession();
  const categories = useCategories(workspace.id);
  const owners = useOwnerLabels(workspace.id);
  const { createAsset, updateAsset } = useAssetActions();
  const tags = useTags(workspace.id);
  const existingTagIds = useAssetTagIds(asset?.id ?? null);
  const { assignTags } = useTagActions();
  const [pending, setPending] = useState(false);
  const [customFieldErrors, setCustomFieldErrors] = useState<Record<string, string>>({});
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(asset ? existingTagIds : []);

  const form = useForm<CreateAssetInput>({
    resolver: zodResolver(createAssetSchema),
    defaultValues: {
      workspaceId: workspace.id,
      categoryId: asset?.categoryId ?? null,
      ownerLabelId: asset?.ownerLabelId ?? null,
      parentAssetId: asset?.parentAssetId ?? null,
      name: asset?.name ?? '',
      code: asset?.code ?? '',
      status: asset?.status ?? 'active',
      location: asset?.location ?? '',
      notes: asset?.notes ?? '',
      purchasePrice: asset?.purchasePrice ?? '',
      purchaseCurrency: asset?.purchaseCurrency ?? workspace.displayCurrency,
      purchaseDate: asset?.purchaseDate ?? '',
      currentValue: asset?.currentValue ?? '',
      currentCurrency: asset?.currentCurrency ?? workspace.displayCurrency,
      customFields: asset?.customFields ?? {},
    },
  });

  const watchedCategoryId = form.watch('categoryId') ?? null;
  const watchedCustomFields = form.watch('customFields') ?? {};
  const dynamicFields = useCategoryFields(watchedCategoryId);
  const allAssets = useAssets(workspace.id, { includeArchived: true });
  const candidateParents = allAssets.filter((a) => {
    if (!asset) return true;
    if (a.id === asset.id) return false;
    let current: string | null = a.parentAssetId;
    const visited = new Set<string>();
    while (current && !visited.has(current)) {
      if (current === asset.id) return false;
      visited.add(current);
      const p = allAssets.find((x) => x.id === current);
      current = p ? p.parentAssetId : null;
    }
    return true;
  });

  function validateCustomFields(values: Record<string, unknown>): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const field of dynamicFields) {
      const raw = values[field.key];
      const present =
        raw != null &&
        !(typeof raw === 'string' && raw.trim() === '') &&
        !(Array.isArray(raw) && raw.length === 0);
      if (field.required && !present) {
        errors[field.key] = `${field.label} is required`;
      }
      if (present) {
        if (field.type === 'number' || field.type === 'currency') {
          const n = Number.parseFloat(String(raw));
          if (Number.isNaN(n)) errors[field.key] = `${field.label} must be a number`;
        }
        if (
          field.type === 'select' &&
          field.options &&
          typeof raw === 'string' &&
          !field.options.includes(raw)
        ) {
          errors[field.key] = `Invalid option for ${field.label}`;
        }
        if (field.type === 'multi_select' && field.options && Array.isArray(raw)) {
          const bad = (raw as string[]).find((v) => !field.options?.includes(v));
          if (bad) errors[field.key] = `Invalid option for ${field.label}`;
        }
      }
    }
    return errors;
  }

  function onSubmit(values: CreateAssetInput) {
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }
    const cfErrors = validateCustomFields(values.customFields ?? {});
    setCustomFieldErrors(cfErrors);
    if (Object.keys(cfErrors).length > 0) {
      toast.error('Custom fields have errors');
      return;
    }
    setPending(true);
    try {
      let assetId: string;
      if (asset) {
        updateAsset({ id: asset.id, ...values, actorId: user.id, actorName: user.name });
        assetId = asset.id;
      } else {
        const created = createAsset({ ...values, actorId: user.id, actorName: user.name });
        assetId = created.id;
      }
      assignTags({
        assetId,
        tagIds: selectedTagIds,
        workspaceId: workspace.id,
        actorId: user.id,
        actorName: user.name,
      });
      toast.success(asset ? 'Asset updated' : 'Asset created');
      router.push(`/app/w/${workspace.slug}/assets/${assetId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Name *</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Mobil Avanza, Macbook M3, …" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground">No categories yet</div>
                    ) : (
                      categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.icon ? `${c.icon} ` : ''}
                          {c.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="ownerLabelId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Owner</FormLabel>
                <Select value={field.value ?? ''} onValueChange={(v) => field.onChange(v || null)}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pick owner" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {owners.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground">No owners yet</div>
                    ) : (
                      owners.map((o) => (
                        <SelectItem key={o.id} value={o.id}>
                          {o.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Code</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="Serial / SKU" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="parentAssetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Parent asset</FormLabel>
                <Select
                  value={field.value ?? '__none'}
                  onValueChange={(v) => field.onChange(v === '__none' ? null : v)}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="No parent" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__none">No parent (root)</SelectItem>
                    {candidateParents.length === 0 ? (
                      <div className="p-2 text-xs text-muted-foreground">No candidates</div>
                    ) : (
                      candidateParents.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Location</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="grid gap-4 border-t border-border pt-6 sm:grid-cols-3">
          <h3 className="col-span-full text-sm uppercase tracking-wider text-muted-foreground">
            Purchase
          </h3>
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="text" inputMode="decimal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchaseCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} maxLength={3} className="uppercase" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchaseDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="date" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="grid gap-4 border-t border-border pt-6 sm:grid-cols-2">
          <h3 className="col-span-full text-sm uppercase tracking-wider text-muted-foreground">
            Current value
          </h3>
          <FormField
            control={form.control}
            name="currentValue"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Value</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} type="text" inputMode="decimal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currentCurrency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} maxLength={3} className="uppercase" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        {watchedCategoryId ? (
          <section className="border-t border-border pt-6">
            <h3 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
              Custom fields
            </h3>
            <DynamicFields
              categoryId={watchedCategoryId}
              values={watchedCustomFields}
              errors={customFieldErrors}
              onChange={(next) => {
                form.setValue('customFields', next, { shouldDirty: true });
                if (Object.keys(customFieldErrors).length > 0) {
                  setCustomFieldErrors({});
                }
              }}
            />
          </section>
        ) : null}

        {tags.length > 0 ? (
          <section className="border-t border-border pt-6">
            <h3 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tags.map((t) => {
                const checked = selectedTagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setSelectedTagIds((prev) =>
                        prev.includes(t.id) ? prev.filter((id) => id !== t.id) : [...prev, t.id],
                      )
                    }
                    className="border border-border px-3 py-1 text-xs transition-colors"
                    style={
                      checked
                        ? { background: t.color ?? 'var(--foreground)', color: '#fafafa' }
                        : undefined
                    }
                  >
                    {t.name}
                  </button>
                );
              })}
            </div>
          </section>
        ) : null}

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea rows={3} {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-2 border-t border-border pt-6">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(`/app/w/${workspace.slug}/assets`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Saving…' : asset ? 'Save changes' : 'Create asset'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
