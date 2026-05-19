import type { Metadata } from 'next';
import Link from 'next/link';

import { Button } from '@/src/shared/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';

export const metadata: Metadata = { title: 'Onboarding · Valbook' };

const TEMPLATES = [
  { id: 'blank', name: 'Blank', description: 'Start from scratch.' },
  {
    id: 'personal-wealth',
    name: 'Personal Wealth',
    description: 'Tabungan, Saham, Crypto, Emas, Property.',
  },
  {
    id: 'family-asset',
    name: 'Family Asset',
    description: 'Rumah, Kendaraan, Elektronik, Furniture.',
  },
  {
    id: 'office-equipment',
    name: 'Office Equipment',
    description: 'Laptop, Monitor, Peripheral, Lisensi.',
  },
  { id: 'real-estate', name: 'Real Estate', description: 'Tanah, Rumah, Apartemen, Ruko.' },
  {
    id: 'crypto-portfolio',
    name: 'Crypto Portfolio',
    description: 'Bitcoin, Ethereum, Altcoin, Stablecoin.',
  },
];

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

        <form className="space-y-8">
          <section>
            <h2 className="mb-3 text-sm uppercase tracking-wider text-muted-foreground">
              Pick template
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {TEMPLATES.map((tpl) => (
                <Card key={tpl.id} className="cursor-pointer hover:border-foreground">
                  <CardHeader>
                    <CardTitle className="text-base">{tpl.name}</CardTitle>
                    <CardDescription>{tpl.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-sm uppercase tracking-wider text-muted-foreground">
              Workspace details
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Workspace name</Label>
                <Input id="name" name="name" placeholder="Family Asset" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Display currency</Label>
                <Input id="currency" name="currency" defaultValue="IDR" required />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-between border-t border-border pt-6">
            <Button variant="ghost" asChild>
              <Link href="/app">Skip</Link>
            </Button>
            <Button type="submit">Create workspace</Button>
          </div>
        </form>
      </div>
    </main>
  );
}
