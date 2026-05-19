'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/src/shared/utils/cn';

export type WorkspaceSidebarProps = {
  slug: string;
};

const NAV_ITEMS = [
  { label: 'Dashboard', href: '' },
  { label: 'Assets', href: '/assets' },
  { label: 'Categories', href: '/categories' },
  { label: 'Owners', href: '/owners' },
  { label: 'Tags', href: '/tags' },
  { label: 'Members', href: '/members' },
  { label: 'Activity', href: '/activity' },
  { label: 'Sharing', href: '/sharing' },
  { label: 'Settings', href: '/settings' },
];

export function WorkspaceSidebar({ slug }: WorkspaceSidebarProps) {
  const pathname = usePathname();
  const base = `/app/w/${slug}`;
  return (
    <nav className="hidden w-56 flex-shrink-0 border-r border-border bg-sidebar text-sidebar-foreground md:block">
      <div className="sticky top-14 p-4">
        <p className="mb-3 text-xs uppercase tracking-wider text-muted-foreground">Workspace</p>
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => {
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
      </div>
    </nav>
  );
}
