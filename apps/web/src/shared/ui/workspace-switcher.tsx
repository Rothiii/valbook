'use client';

import Link from 'next/link';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/shared/ui/dropdown-menu';

export type Workspace = {
  slug: string;
  name: string;
};

export type WorkspaceSwitcherProps = {
  current?: Workspace;
  workspaces?: Workspace[];
};

export function WorkspaceSwitcher({ current, workspaces = [] }: WorkspaceSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 px-2 py-1 text-sm hover:bg-muted">
        <span>{current ? current.name : 'No workspace'}</span>
        <span className="text-muted-foreground">▾</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        <DropdownMenuLabel className="text-xs uppercase tracking-wider text-muted-foreground">
          Workspaces
        </DropdownMenuLabel>
        {workspaces.length === 0 ? (
          <DropdownMenuItem disabled>No workspace yet</DropdownMenuItem>
        ) : (
          workspaces.map((ws) => (
            <DropdownMenuItem key={ws.slug} asChild>
              <Link href={`/app/w/${ws.slug}`}>{ws.name}</Link>
            </DropdownMenuItem>
          ))
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/onboarding">+ Create workspace</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/app">⚙ Manage workspaces</Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
