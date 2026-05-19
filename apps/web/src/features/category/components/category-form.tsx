'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useSession } from '@/src/features/auth/hooks/use-session';
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

import { useCategoryActions } from '../hooks/use-categories';
import { type CreateCategoryInput, createCategorySchema } from '../schema';

export type CategoryFormProps = {
  workspaceId: string;
  onSuccess?: () => void;
};

export function CategoryForm({ workspaceId, onSuccess }: CategoryFormProps) {
  const { user } = useSession();
  const { createCategory } = useCategoryActions();
  const [pending, setPending] = useState(false);

  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { workspaceId, name: '', icon: '', color: '' },
  });

  function onSubmit(values: CreateCategoryInput) {
    if (!user) {
      toast.error('You must be logged in.');
      return;
    }
    setPending(true);
    try {
      createCategory({
        ...values,
        icon: values.icon || undefined,
        color: values.color || undefined,
        actorId: user.id,
        actorName: user.name,
      });
      toast.success('Category created');
      form.reset({ workspaceId, name: '', icon: '', color: '' });
      onSuccess?.();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name *</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Laptop, Rumah, Crypto…" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="icon"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Icon (emoji)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} maxLength={4} placeholder="💻" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color (hex)</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ''} placeholder="#737373" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Create category'}
        </Button>
      </form>
    </Form>
  );
}
