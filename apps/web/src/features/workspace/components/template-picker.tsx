'use client';

import { cn } from '@/src/shared/utils/cn';

import { BUILTIN_TEMPLATES } from '../templates';

export type TemplatePickerProps = {
  value: string;
  onChange: (templateId: string) => void;
};

export function TemplatePicker({ value, onChange }: TemplatePickerProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {BUILTIN_TEMPLATES.map((tpl) => {
        const active = value === tpl.id;
        return (
          <button
            key={tpl.id}
            type="button"
            onClick={() => onChange(tpl.id)}
            className={cn(
              'flex flex-col gap-2 border bg-card p-4 text-left transition-colors',
              active ? 'border-foreground' : 'border-border hover:border-foreground/60',
            )}
          >
            <span className="text-xl">{tpl.icon}</span>
            <span className="text-sm">{tpl.name}</span>
            <span className="text-xs text-muted-foreground">{tpl.description}</span>
            <span className="text-xs text-muted-foreground">
              {tpl.definition.categories.length} category preset
            </span>
          </button>
        );
      })}
    </div>
  );
}
