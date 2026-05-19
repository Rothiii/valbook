import Link from 'next/link';
import type * as React from 'react';

export type AuthCardProps = {
  title: string;
  description?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
};

export function AuthCard({ title, description, footer, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-12">
      <header className="mb-8">
        <Link href="/" className="text-xs uppercase tracking-wider text-muted-foreground">
          Valbook
        </Link>
      </header>
      <main className="w-full max-w-sm">
        <div className="border border-border bg-card p-8">
          <h1 className="mb-1 text-xl">{title}</h1>
          {description ? (
            <p className="mb-6 text-sm text-muted-foreground">{description}</p>
          ) : (
            <div className="mb-6" />
          )}
          {children}
        </div>
        {footer ? (
          <div className="mt-4 text-center text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </main>
    </div>
  );
}
