import Link from 'next/link';

import { Button } from '@/src/shared/ui/button';

const FEATURES = [
  {
    title: 'Dynamic categories',
    body: 'Custom fields per kategori. Text, number, date, select, currency — atur sesuai kebutuhan domain.',
  },
  {
    title: 'Valuation history',
    body: 'Track perubahan nilai aset over time. Auto-update current value, line chart, manual + CSV bulk import.',
  },
  {
    title: 'Multi-currency',
    body: 'IDR, USD, EUR, SGD, JPY, BTC, ETH, USDT. 2-hop convert lewat pivot rate, override manual per workspace.',
  },
  {
    title: 'Multi-user workspace',
    body: 'Owner / Editor / Viewer role. Invite via email, audit log per mutation, asset hierarchy 5 level.',
  },
  {
    title: 'Tags + attachments',
    body: 'Multi-tag per asset, file attachment 25MB (image / PDF / doc / sheet), preview inline.',
  },
  {
    title: 'Public sharing',
    body: 'Share workspace atau aset spesifik via link read-only. Expiry, revoke, scope-bound, no auth required.',
  },
];

const TEMPLATES = [
  { name: 'Personal Wealth', desc: 'Tabungan · Saham · Crypto · Emas · Property' },
  { name: 'Family Asset', desc: 'Rumah · Kendaraan · Elektronik · Furniture · Koleksi' },
  { name: 'Office Equipment', desc: 'Laptop · Monitor · Furniture · Peripheral · License' },
  { name: 'Real Estate', desc: 'Rumah · Apartemen · Tanah · Komersial · Properti sewa' },
  { name: 'Crypto Portfolio', desc: 'BTC · ETH · Altcoin · Stablecoin · DeFi' },
  { name: 'Blank', desc: 'Start dari nol. Tanpa kategori bawaan.' },
];

const STEPS = [
  {
    n: '01',
    title: 'Buat workspace',
    body: 'Pilih template atau mulai blank. Workspace = unit independen untuk satu konteks (pribadi, keluarga, kantor).',
  },
  {
    n: '02',
    title: 'Catat aset',
    body: 'Isi nama, kategori, owner, nilai. Custom field per kategori. Hierarchy parent-child kalau butuh.',
  },
  {
    n: '03',
    title: 'Track + share',
    body: 'Update valuasi berkala, lihat dashboard total, share read-only ke stakeholder via link expirable.',
  },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col bg-background text-foreground">
      <Nav />
      <Hero />
      <Section
        eyebrow="Features"
        title="Yang kamu dapat."
        description="Workspace-based asset management dengan custom schema + collaboration + audit trail."
      >
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-background p-6">
              <h3 className="text-sm uppercase tracking-wider">{f.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="Use cases"
        title="Template untuk berbagai kebutuhan."
        description="Pilih satu sebagai starting point. Semua field bisa di-customize setelah workspace dibuat."
      >
        <div className="grid gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((t) => (
            <div key={t.name} className="bg-background p-6">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Template</p>
              <h3 className="mt-2 text-base">{t.name}</h3>
              <p className="mt-2 text-xs text-muted-foreground">{t.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section
        eyebrow="How it works"
        title="Tiga langkah."
        description="Dari sign up sampai punya dashboard pertama dalam <5 menit."
      >
        <div className="grid gap-px border border-border bg-border lg:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="bg-background p-8">
              <p className="text-3xl text-muted-foreground">{s.n}</p>
              <h3 className="mt-4 text-base">{s.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaFooter />
      <Footer />
    </main>
  );
}

function Nav() {
  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xs uppercase tracking-wider">Valbook</span>
          <span className="text-xs text-muted-foreground">/</span>
          <span className="text-xs text-muted-foreground">Asset workspace</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/register">Get started →</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
}

function Hero() {
  return (
    <section className="border-b border-border">
      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 lg:grid-cols-5 lg:py-28">
        <div className="lg:col-span-3">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            Collaborative asset workspace platform
          </p>
          <h1 className="mt-4 text-5xl leading-tight md:text-6xl">
            Catat, kelola,
            <br />
            dan nilai aset.
            <br />
            <span className="text-muted-foreground">Kolaboratif.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
            Workspace-based platform untuk recording, managing, dan visualising data aset
            collaboratively. Personal wealth, family asset, office equipment, portfolio monitoring —
            satu app untuk semua.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/register">Get started free →</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-muted-foreground">
            Free during beta · No credit card · Self-hostable
          </p>
        </div>
        <div className="lg:col-span-2">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <div className="border border-border bg-background font-mono text-xs">
      <div className="flex items-center justify-between border-b border-border bg-muted px-3 py-2">
        <span className="text-muted-foreground">~/personal-demo</span>
        <span className="text-muted-foreground">IDR</span>
      </div>
      <div className="space-y-4 p-4">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total value</p>
          <p className="mt-1 text-xl">IDR 2,485,000,000</p>
          <p className="mt-1 text-[10px] text-emerald-600">+12.4% (30d)</p>
        </div>
        <div className="grid grid-cols-3 gap-px border border-border bg-border">
          <div className="bg-background p-2">
            <p className="text-[10px] text-muted-foreground">Active</p>
            <p className="mt-1">23</p>
          </div>
          <div className="bg-background p-2">
            <p className="text-[10px] text-muted-foreground">Archived</p>
            <p className="mt-1">4</p>
          </div>
          <div className="bg-background p-2">
            <p className="text-[10px] text-muted-foreground">Growth</p>
            <p className="mt-1 text-emerald-600">+12%</p>
          </div>
        </div>
        <div>
          <p className="mb-2 text-[10px] uppercase tracking-wider text-muted-foreground">
            By category
          </p>
          <ul className="space-y-1.5">
            <CategoryRow label="Saham" count={8} width="80%" />
            <CategoryRow label="Property" count={5} width="50%" />
            <CategoryRow label="Crypto" count={4} width="40%" />
            <CategoryRow label="Emas" count={3} width="30%" />
            <CategoryRow label="Tabungan" count={3} width="30%" />
          </ul>
        </div>
        <div className="border-t border-border pt-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Recent activity
          </p>
          <ul className="mt-2 space-y-1 text-[11px] text-muted-foreground">
            <li>• Demo User added BBCA valuation</li>
            <li>• Demo User archived old laptop</li>
            <li>• Demo User updated apartment notes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function CategoryRow({ label, count, width }: { label: string; count: number; width: string }) {
  return (
    <li className="flex items-center justify-between gap-2">
      <span className="w-20 shrink-0">{label}</span>
      <div className="h-1.5 flex-1 bg-muted">
        <div className="h-full bg-foreground" style={{ width }} />
      </div>
      <span className="w-6 text-right text-muted-foreground">{count}</span>
    </li>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-border">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 max-w-2xl">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
          <h2 className="mt-3 text-3xl md:text-4xl">{title}</h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">{description}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

function CtaFooter() {
  return (
    <section className="border-b border-border bg-muted">
      <div className="mx-auto max-w-6xl px-6 py-24 text-center">
        <h2 className="text-3xl md:text-4xl">Mulai sekarang. Gratis.</h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-muted-foreground">
          Buat workspace pertama dalam 30 detik. Pilih template, tambah aset, share ke tim atau
          keluarga.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/register">Get started free →</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-4">
        <div>
          <p className="text-xs uppercase tracking-wider">Valbook</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Collaborative Asset Workspace Platform
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Product</p>
          <ul className="mt-3 space-y-2 text-xs">
            <li>
              <Link href="/register" className="hover:underline">
                Get started
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:underline">
                Sign in
              </Link>
            </li>
            <li>
              <Link href="/documentation" className="hover:underline">
                Design system
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Resources</p>
          <ul className="mt-3 space-y-2 text-xs">
            <li>
              <a
                href="https://github.com/Rothiii/valbook"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:underline"
              >
                GitHub →
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Status</p>
          <p className="mt-3 text-xs text-muted-foreground">Beta · Self-hostable</p>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-xs text-muted-foreground">
          <span>© 2026 Valbook</span>
          <span>Made with care</span>
        </div>
      </div>
    </footer>
  );
}
