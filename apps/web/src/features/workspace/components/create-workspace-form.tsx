'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useSession } from '@/src/features/auth/hooks/use-session';
import { Button } from '@/src/shared/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/shared/ui/form';
import { Input } from '@/src/shared/ui/input';

import { useWorkspaceActions } from '../hooks/use-workspace-actions';
import { useWorkspaces } from '../hooks/use-workspaces';
import { type CreateWorkspaceInput, createWorkspaceSchema } from '../schema';
import { TemplatePicker } from './template-picker';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

export function CreateWorkspaceForm() {
  const router = useRouter();
  const { user } = useSession();
  const { createWorkspace } = useWorkspaceActions();
  const existingWorkspaces = useWorkspaces();
  const [pending, setPending] = useState(false);

  const form = useForm<CreateWorkspaceInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: '',
      slug: '',
      displayCurrency: 'IDR',
      templateId: 'blank',
    },
  });

  function onNameChange(name: string) {
    form.setValue('name', name);
    if (!form.getFieldState('slug').isDirty) {
      form.setValue('slug', slugify(name));
    }
  }

  function onSubmit(values: CreateWorkspaceInput) {
    if (!user) {
      toast.error('You must be logged in.');
      router.push('/login');
      return;
    }
    if (existingWorkspaces.some((w) => w.slug === values.slug)) {
      form.setError('slug', { message: 'Slug already taken' });
      return;
    }
    setPending(true);
    try {
      const ws = createWorkspace({
        ...values,
        ownerUserId: user.id,
        ownerName: user.name,
        ownerEmail: user.email,
      });
      toast.success('Workspace created');
      router.push(`/app/w/${ws.slug}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create workspace');
    } finally {
      setPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <section>
          <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
            Pick template
          </h2>
          <FormField
            control={form.control}
            name="templateId"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <TemplatePicker value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-4">
          <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
            Workspace details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace name *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      onChange={(e) => onNameChange(e.target.value)}
                      placeholder="Family Asset"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="family-asset" />
                  </FormControl>
                  <FormDescription>URL-safe identifier.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayCurrency"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel>Display currency *</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={3} className="uppercase" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="flex items-center justify-between border-t border-border pt-6">
          <Button variant="ghost" type="button" onClick={() => router.push('/app')}>
            Skip
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? 'Creating…' : 'Create workspace'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
