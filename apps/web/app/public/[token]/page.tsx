import type { Metadata } from 'next';

import { Card, CardContent, CardHeader, CardTitle } from '@/src/shared/ui/card';

export const metadata: Metadata = {
  title: 'Shared view · Valbook',
  robots: { index: false, follow: false },
};

export default async function PublicSharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token: _token } = await params;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-muted/30 px-6 py-3">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            👁 Read-only view · Valbook
          </p>
          <p className="text-xs text-muted-foreground">Shared by Rafid</p>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Total value
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">Rp 0</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Asset count
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">0</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xs uppercase tracking-wider text-muted-foreground">
                Currency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl">IDR</p>
            </CardContent>
          </Card>
        </div>

        <p className="text-sm text-muted-foreground">
          This public share view will populate when the sharing feature is implemented in Phase 5.
        </p>
      </div>

      <footer className="mt-12 border-t border-border px-6 py-4 text-center text-xs text-muted-foreground">
        Powered by Valbook
      </footer>
    </main>
  );
}
