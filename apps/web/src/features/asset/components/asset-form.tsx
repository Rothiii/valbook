'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useSession } from '@/src/features/auth/hooks/use-session';
import { useCategories } from '@/src/features/category/hooks/use-categories';
import { useOwnerLabels } from '@/src/features/owner-label/hooks/use-owner-labels';
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

import { useAssetActions } from '../hooks/use-assets';
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
  const [pending, setPending] = useState(false);

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

  function onSubmit(values: CreateAssetInput) {
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }
    setPending(true);
    try {
      if (asset) {
        updateAsset({ id: asset.id, ...values, actorId: user.id, actorName: user.name });
        toast.success('Asset updated');
        router.push(`/app/w/${workspace.slug}/assets/${asset.id}`);
      } else {
        const created = createAsset({ ...values, actorId: user.id, actorName: user.name });
        toast.success('Asset created');
        router.push(`/app/w/${workspace.slug}/assets/${created.id}`);
      }
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
