'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

import { useNavHistory } from './nav-history';

export function NavHistoryTracker() {
  const pathname = usePathname();
  const record = useNavHistory((s) => s.record);

  useEffect(() => {
    record(pathname);
  }, [pathname, record]);

  return null;
}
