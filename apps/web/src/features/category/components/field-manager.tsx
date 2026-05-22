'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Save, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSession } from '@/src/features/auth/hooks/use-session';
import { notify } from '@/src/shared/lib/notify';
import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { Checkbox } from '@/src/shared/ui/checkbox';
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
  onClose?: () => void;
};

export function FieldManager({ category, workspaceId, onClose }: FieldManagerProps) {
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
      notify.success('Field added');
      form.reset({
        categoryId: category.id,
        key: '',
        label: '',
        type: 'text',
        required: false,
        options: undefined,
      });
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'Failed');
    } finally {
      setPending(false);
    }
  }

  function handleDelete(field: CategoryField) {
    if (!user) return;
    if (!confirm(`Delete field "${field.label}"?`)) return;
    deleteField({ id: field.id, workspaceId, actorId: user.id, actorName: user.name });
    notify.success('Field deleted');
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-border bg-muted/20">
        <header className="flex items-center justify-between border-b border-border px-5 py-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Existing fields
          </h3>
          <span className="text-xs text-muted-foreground">{fields.length} total</span>
        </header>
        {fields.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-muted-foreground">
            No custom fields yet. Add one below to start collecting data.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {fields.map((f) => (
              <li
                key={f.id}
                className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-muted/40"
              >
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{f.label}</p>
                      {f.required ? (
                        <span className="text-xs text-destructive/80" title="Required">
                          *
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      <code className="rounded bg-muted px-1 py-0.5 font-mono">{f.key}</code>
                      {f.options?.length ? ` · ${f.options.length} options` : ''}
                    </p>
                  </div>
                  <Badge
                    variant="outline"
                    className="shrink-0 text-[10px] font-medium uppercase tracking-wider"
                  >
                    {f.type.replace('_', ' ')}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => handleDelete(f)}
                  aria-label={`Delete ${f.label}`}
                  className="text-destructive/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <section className="rounded-xl border border-border bg-card">
            <header className="border-b border-border px-5 py-3">
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Add field
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                New fields become available when creating or editing assets in this category.
              </p>
            </header>

            <div className="space-y-5 px-5 py-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input {...field} onChange={(e) => onLabelChange(e.target.value)} />
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
                      <FormLabel>Key</FormLabel>
                      <FormControl>
                        <Input {...field} className="font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
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
                        <div className="flex h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm transition-colors hover:bg-muted/50">
                          <Checkbox
                            checked={field.value ?? false}
                            onCheckedChange={(v) => field.onChange(v === true)}
                          />
                        </div>
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
                      <FormLabel>Options</FormLabel>
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
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            <footer className="flex items-center justify-end gap-2 border-t border-border bg-muted/20 px-5 py-3">
              <Button type="button" variant="ghost" onClick={() => onClose?.()}>
                Batalkan
              </Button>
              <Button
                type="submit"
                disabled={pending}
                className="disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save />
                {pending ? 'Menyimpan…' : 'Simpan'}
              </Button>
            </footer>
          </section>
        </form>
      </Form>
    </div>
  );
}
