'use client';

import { Checkbox } from '@/src/shared/ui/checkbox';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/shared/ui/select';

import { useCategoryFields } from '../hooks/use-fields';
import type { CategoryField } from '../types';

export type DynamicFieldsProps = {
  categoryId: string | null;
  values: Record<string, unknown>;
  onChange: (values: Record<string, unknown>) => void;
  errors?: Record<string, string>;
};

export function DynamicFields({ categoryId, values, onChange, errors }: DynamicFieldsProps) {
  const fields = useCategoryFields(categoryId);

  if (!categoryId) {
    return (
      <p className="text-sm text-muted-foreground">Pick a category to render custom fields.</p>
    );
  }

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        This category has no custom fields yet. Add fields via Categories settings.
      </p>
    );
  }

  function setValue(key: string, value: unknown) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => (
        <FieldInput
          key={field.id}
          field={field}
          value={values[field.key]}
          error={errors?.[field.key]}
          onChange={(v) => setValue(field.key, v)}
        />
      ))}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
  error,
}: {
  field: CategoryField;
  value: unknown;
  onChange: (v: unknown) => void;
  error?: string;
}) {
  const id = `field-${field.id}`;
  const labelEl = (
    <Label htmlFor={id} className="flex items-center gap-1">
      {field.label}
      {field.required ? <span className="text-destructive">*</span> : null}
    </Label>
  );

  let control: React.ReactNode;

  switch (field.type) {
    case 'text':
    case 'url':
      control = (
        <Input
          id={id}
          type={field.type === 'url' ? 'url' : 'text'}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case 'number':
    case 'currency':
      control = (
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={typeof value === 'string' || typeof value === 'number' ? String(value) : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case 'date':
      control = (
        <Input
          id={id}
          type="date"
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
      break;
    case 'boolean':
      control = (
        <div className="flex items-center gap-2 text-sm">
          <Checkbox
            id={id}
            checked={value === true}
            onCheckedChange={(c) => onChange(c === true)}
          />
          <Label htmlFor={id} className="m-0">
            Yes
          </Label>
        </div>
      );
      break;
    case 'select': {
      const opts = field.options ?? [];
      control = (
        <Select value={typeof value === 'string' ? value : ''} onValueChange={(v) => onChange(v)}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select…" />
          </SelectTrigger>
          <SelectContent>
            {opts.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
      break;
    }
    case 'multi_select': {
      const opts = field.options ?? [];
      const arr = Array.isArray(value) ? (value as string[]) : [];
      control = (
        <div className="flex flex-wrap gap-2">
          {opts.map((o) => {
            const checked = arr.includes(o);
            const optId = `${id}-${o}`;
            return (
              <div
                key={o}
                className="flex items-center gap-2 border border-border px-2 py-1 text-xs"
              >
                <Checkbox
                  id={optId}
                  checked={checked}
                  onCheckedChange={(c) => {
                    const next = c
                      ? [...arr.filter((x) => x !== o), o]
                      : arr.filter((x) => x !== o);
                    onChange(next);
                  }}
                />
                <Label htmlFor={optId} className="m-0">
                  {o}
                </Label>
              </div>
            );
          })}
        </div>
      );
      break;
    }
    default:
      control = (
        <Input
          id={id}
          value={typeof value === 'string' ? value : ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }

  return (
    <div className="space-y-2">
      {labelEl}
      {control}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
