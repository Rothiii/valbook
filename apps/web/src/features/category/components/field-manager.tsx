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
  FormDescription,
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

import { useCategoryFields, useFieldActions } from '../hooks/use-fields';
import { type CreateFieldInput, createFieldSchema } from '../schema';
import type { Category, CategoryField } from '../types';

const FIELD_TYPES: Array<{ value: CategoryField['type']; label: string }> = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select (single)' },
  { value: 'multi_select', label: 'Select (multi)' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'url', label: 'URL' },
  { value: 'currency', label: 'Currency' },
];

function slugifyKey(label: string): string {
  return label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/^([0-9])/, 'f_$1')
    .slice(0, 50);
}

export type FieldManagerProps = {
  category: Category;
  workspaceId: string;
};

export function FieldManager({ category, workspaceId }: FieldManagerProps) {
  const fields = useCategoryFields(category.id);
  const { user } = useSession();
  const { createField, deleteField } = useFieldActions();
  const [pending, setPending] = useState(false);

  const form = useForm<CreateFieldInput>({
    resolver: zodResolver(createFieldSchema),
    defaultValues: {
      categoryId: category.id,
      key: '',
      label: '',
      type: 'text',
      required: false,
      options: undefined,
    },
  });

  const watchedType = form.watch('type');
  const showOptions = watchedType === 'select' || watchedType === 'multi_select';

  function onLabelChange(label: string) {
    form.setValue('label', label);
    if (!form.getFieldState('key').isDirty) {
      form.setValue('key', slugifyKey(label));
    }
  }

  function onSubmit(values: CreateFieldInput) {
    if (!user) return;
    setPending(true);
    try {
      const cleanedOptions = showOptions
        ? (values.options ?? []).map((o) => o.trim()).filter(Boolean)
        : undefined;
      createField({
        ...values,
        options: cleanedOptions,
        workspaceId,
        actorId: user.id,
        actorName: user.name,
      });
      toast.success('Field added');
      form.reset({
        categoryId: category.id,
        key: '',
        label: '',
        type: 'text',
        required: false,
        options: undefined,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed');
    } finally {
      setPending(false);
    }
  }

  function handleDelete(field: CategoryField) {
    if (!user) return;
    if (!confirm(`Delete field "${field.label}"?`)) return;
    deleteField({ id: field.id, workspaceId, actorId: user.id, actorName: user.name });
    toast.success('Field deleted');
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
          Fields ({fields.length})
        </h3>
        {fields.length === 0 ? (
          <p className="text-sm text-muted-foreground">No custom fields yet.</p>
        ) : (
          <ul className="divide-y divide-border border border-border">
            {fields.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <div>
                  <p>
                    {f.label}
                    {f.required ? <span className="ml-1 text-destructive">*</span> : null}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <code>{f.key}</code> · {f.type}
                    {f.options?.length ? ` · ${f.options.length} options` : ''}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(f)}>
                  Delete
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-3 border-t border-border pt-4"
        >
          <h3 className="text-sm uppercase tracking-wider text-muted-foreground">Add field</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Label *</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Chip, RAM, Sertifikat…"
                      onChange={(e) => onLabelChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Key *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="chip, ram, sertifikat" />
                  </FormControl>
                  <FormDescription>snake_case, immutable.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type *</FormLabel>
                  <Select value={field.value} onValueChange={(v) => field.onChange(v)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {FIELD_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="required"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Required</FormLabel>
                  <FormControl>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={field.value ?? false}
                        onChange={(e) => field.onChange(e.target.checked)}
                      />
                      Field is required
                    </label>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          {showOptions ? (
            <FormField
              control={form.control}
              name="options"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Options (comma-separated) *</FormLabel>
                  <FormControl>
                    <Input
                      value={(field.value ?? []).join(', ')}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value
                            .split(',')
                            .map((o) => o.trim())
                            .filter(Boolean),
                        )
                      }
                      placeholder="Option A, Option B, Option C"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ) : null}
          <Button type="submit" disabled={pending}>
            {pending ? 'Adding…' : '+ Add field'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
