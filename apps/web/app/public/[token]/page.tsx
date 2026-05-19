import type { Metadata } from 'next';

import { PublicView } from '@/src/features/sharing/components/public-view';

export const metadata: Metadata = {
  title: 'Shared view · Valbook',
  robots: { index: false, follow: false },
};

export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <PublicView token={token} />;
}
