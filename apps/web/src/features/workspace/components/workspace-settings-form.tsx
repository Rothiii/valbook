'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
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

import { useWorkspaceActions } from '../hooks/use-workspace-actions';
import { type UpdateWorkspaceInput, updateWorkspaceSchema } from '../schema';
import type { Workspace } from '../types';

export type WorkspaceSettingsFormProps = {
  workspace: Workspace;
};

export function WorkspaceSettingsForm({ workspace }: WorkspaceSettingsFormProps) {
  const router = useRouter();
  const { updateWorkspace } = useWorkspaceActions();
  const [pending, setPending] = useState(false);

  const form = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      slug: workspace.slug,
      name: workspace.name,
      newSlug: workspace.slug,
      displayCurrency: workspace.displayCurrency,
    },
  });

  function onSubmit(values: UpdateWorkspaceInput) {
    setPending(true);
    try {
      updateWorkspace({
        slug: workspace.slug,
        name: values.name,
        newSlug: values.newSlug,
        displayCurrency: values.displayCurrency,
      });
      notify.success('Workspace updated');
      const nextSlug = values.newSlug ?? workspace.slug;
      if (nextSlug !== workspace.slug) {
        router.push(`/app/w/${nextSlug}/settings`);
      }
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Update failed');
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="newSlug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="displayCurrency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display currency</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ''} maxLength={3} className="uppercase" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </Form>
  );
}
