import type * as React from 'react';

export type EmptyStateProps = {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center border border-dashed border-border bg-muted/30 p-12 text-center">
      {icon ? <div className="mb-4 text-3xl text-muted-foreground">{icon}</div> : null}
      <h2 className="mb-2 text-lg">{title}</h2>
      {description ? (
        <p className="mb-6 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action}
    </div>
  );
}
