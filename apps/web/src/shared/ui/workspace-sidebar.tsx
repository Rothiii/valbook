'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import {
  useCurrentMembership,
  useWorkspaceBySlug,
} from '@/src/features/workspace/hooks/use-workspaces';
import type { WorkspaceRole } from '@/src/features/workspace/types';
import { cn } from '@/src/shared/utils/cn';

export type WorkspaceSidebarProps = {
  slug: string;
};

type NavItem = {
  label: string;
  href: string;
  minRole?: WorkspaceRole;
};

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '' },
  { label: 'Assets', href: '/assets' },
  { label: 'Categories', href: '/categories' },
  { label: 'Owners', href: '/owners' },
  { label: 'Tags', href: '/tags' },
  { label: 'Members', href: '/members' },
  { label: 'Activity', href: '/activity' },
  { label: 'Sharing', href: '/sharing', minRole: 'owner' },
  { label: 'Settings', href: '/settings', minRole: 'owner' },
];

const ROLE_RANK: Record<WorkspaceRole, number> = { viewer: 1, editor: 2, owner: 3 };

function canAccess(role: WorkspaceRole | null, minRole?: WorkspaceRole): boolean {
  if (!minRole) return true;
  if (!role) return false;
  return ROLE_RANK[role] >= ROLE_RANK[minRole];
}

export function WorkspaceSidebar({ slug }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const workspace = useWorkspaceBySlug(slug);
  const membership = useCurrentMembership(workspace?.id);
  const role = membership.role;
  const base = `/app/w/${slug}`;
  const items = NAV_ITEMS.filter((item) => canAccess(role, item.minRole));

  return (
    <nav className="hidden w-56 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:block">
      <div className="sticky top-14 p-4">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Workspace</p>
        <ul className="space-y-1">
          {items.map((item) => {
            const href = `${base}${item.href}`;
            const active = pathname === href || (item.href !== '' && pathname.startsWith(href));
            return (
              <li key={item.label}>
                <Link
                  href={href}
                  className={cn(
                    'block px-2 py-1 text-sm transition-colors',
                    active
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50',
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
        {role ? (
          <p className="mt-6 text-xs text-muted-foreground">
            Your role: <span className="font-medium capitalize text-foreground">{role}</span>
          </p>
        ) : null}
      </div>
    </nav>
  );
}
