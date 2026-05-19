import type { Metadata } from 'next';

import { CreateWorkspaceForm } from '@/src/features/workspace/components/create-workspace-form';

export const metadata: Metadata = { title: 'Onboarding · Valbook' };

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-6 py-16">
        <header className="mb-10">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Step 1 of 1</p>
          <h1 className="text-3xl">Create your first workspace</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Pick a starter template or start blank. You can customize categories later.
          </p>
        </header>

        <CreateWorkspaceForm />
      </div>
    </main>
  );
}
