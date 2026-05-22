'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from '@/src/features/auth/hooks/use-session';
import { notify } from '@/src/shared/lib/notify';
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
import { Textarea } from '@/src/shared/ui/textarea';

import { useValuationActions } from '../hooks/use-valuations';
import { type CreateValuationInput, createValuationSchema } from '../schema';

export type ValuationFormProps = {
  assetId: string;
  workspaceId: string;
  assetName: string;
  defaultCurrency: string;
  onSuccess?: () => void;
};

export function ValuationForm({
  assetId,
  workspaceId,
  assetName,
  defaultCurrency,
  onSuccess,
}: ValuationFormProps) {
  const { user } = useSession();
  const { createValuation } = useValuationActions();
  const [pending, setPending] = useState(false);

  const form = useForm<CreateValuationInput>({
    resolver: zodResolver(createValuationSchema),
    defaultValues: {
      assetId,
      value: '',
      currency: defaultCurrency,
      valuedAt: new Date().toISOString().slice(0, 10),
      note: '',
      source: 'manual',
    },
  });

  function onSubmit(values: CreateValuationInput) {
    if (!user) return;
    setPending(true);
    try {
      createValuation({
        ...values,
        workspaceId,
        assetName,
        actorId: user.id,
        actorName: user.name,
      });
      notify.success('Valuation added');
      form.reset({
        assetId,
        value: '',
        currency: defaultCurrency,
        valuedAt: new Date().toISOString().slice(0, 10),
        note: '',
        source: 'manual',
      });
      onSuccess?.();
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <FormField
            control={form.control}
            name="value"
            render={({ field }) => (
              <FormItem className="sm:col-span-2">
                <FormLabel>Value *</FormLabel>
                <FormControl>
                  <Input {...field} type="text" inputMode="decimal" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="currency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Currency *</FormLabel>
                <FormControl>
                  <Input {...field} maxLength={3} className="uppercase" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="valuedAt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Valued at *</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ''} rows={2} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Add entry'}
        </Button>
      </form>
    </Form>
  );
}
