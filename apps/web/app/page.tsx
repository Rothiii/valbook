import Link from 'next/link';

import { Button } from '@/src/shared/ui/button';

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-background text-foreground">
      <div className="mx-auto flex max-w-2xl flex-col items-start gap-8 px-6 py-24">
        <header>
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Valbook</p>
          <h1 className="text-4xl">Collaborative Asset Workspace</h1>
        </header>

        <p className="text-base leading-relaxed text-muted-foreground">
          Workspace-based platform for recording, managing, and visualising asset data
          collaboratively. Personal wealth tracking, family asset management, company asset
          registry, portfolio monitoring, and lightweight ERP asset use cases.
        </p>

        <p className="text-sm text-muted-foreground">
          Status: <span className="text-foreground">Phase 0 scaffold complete</span> · Phase 1
          implementation upcoming
        </p>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/documentation">Design system</Link>
          </Button>
          <Button asChild variant="outline">
            <a href="https://github.com/Rothiii/valbook" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
          </Button>
        </div>
      </div>
    </main>
  );
}
