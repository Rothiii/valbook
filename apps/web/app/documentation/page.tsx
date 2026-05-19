import type { Metadata } from 'next';

import { Badge } from '@/src/shared/ui/badge';
import { Button } from '@/src/shared/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/shared/ui/card';
import { Checkbox } from '@/src/shared/ui/checkbox';
import { Input } from '@/src/shared/ui/input';
import { Label } from '@/src/shared/ui/label';
import { Separator } from '@/src/shared/ui/separator';
import { Skeleton } from '@/src/shared/ui/skeleton';
import { Textarea } from '@/src/shared/ui/textarea';

export const metadata: Metadata = {
  title: 'Documentation · Valbook',
  description: 'Design system, color palette, typography, and component reference.',
};

const COLOR_TOKENS = [
  { name: 'background', token: 'bg-background', text: 'text-foreground' },
  { name: 'foreground', token: 'bg-foreground', text: 'text-background' },
  { name: 'card', token: 'bg-card', text: 'text-card-foreground' },
  { name: 'card-foreground', token: 'bg-card-foreground', text: 'text-card' },
  { name: 'popover', token: 'bg-popover', text: 'text-popover-foreground' },
  { name: 'primary', token: 'bg-primary', text: 'text-primary-foreground' },
  { name: 'primary-foreground', token: 'bg-primary-foreground', text: 'text-primary' },
  { name: 'secondary', token: 'bg-secondary', text: 'text-secondary-foreground' },
  { name: 'muted', token: 'bg-muted', text: 'text-muted-foreground' },
  { name: 'muted-foreground', token: 'bg-muted-foreground', text: 'text-muted' },
  { name: 'accent', token: 'bg-accent', text: 'text-accent-foreground' },
  { name: 'destructive', token: 'bg-destructive', text: 'text-destructive-foreground' },
  { name: 'border', token: 'bg-border', text: 'text-foreground' },
  { name: 'input', token: 'bg-input', text: 'text-foreground' },
  { name: 'ring', token: 'bg-ring', text: 'text-background' },
];

const SIDEBAR_TOKENS = [
  { name: 'sidebar', token: 'bg-sidebar', text: 'text-sidebar-foreground' },
  { name: 'sidebar-primary', token: 'bg-sidebar-primary', text: 'text-sidebar-primary-foreground' },
  { name: 'sidebar-accent', token: 'bg-sidebar-accent', text: 'text-sidebar-accent-foreground' },
  { name: 'sidebar-border', token: 'bg-sidebar-border', text: 'text-sidebar-foreground' },
  { name: 'sidebar-ring', token: 'bg-sidebar-ring', text: 'text-sidebar-foreground' },
];

const CHART_TOKENS = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];

const TYPOGRAPHY_SCALE = [
  { name: 'text-xs', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'text-sm', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'text-base', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'text-lg', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'text-xl', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'text-2xl', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'text-3xl', sample: 'The quick brown fox jumps over the lazy dog' },
  { name: 'text-4xl', sample: 'The quick brown fox jumps over the lazy dog' },
];

const FONT_WEIGHTS = [
  { name: 'font-light', value: '300' },
  { name: 'font-normal', value: '400' },
  { name: 'font-medium', value: '500' },
  { name: 'font-semibold', value: '600' },
  { name: 'font-bold', value: '700' },
];

export default function DocumentationPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <header className="mb-12 border-b border-border pb-8">
          <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">
            Valbook Design System
          </p>
          <h1 className="text-3xl">Documentation</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Color palette, typography, and component reference. Toggle dark mode by adding the{' '}
            <code className="bg-muted px-1">dark</code> class to the{' '}
            <code className="bg-muted px-1">&lt;html&gt;</code> element.
          </p>
        </header>

        <Section title="01 · Typography" id="typography">
          <SubSection title="Font family">
            <div className="border border-border p-6">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">
                Geist Mono · Single typeface for sans, mono, and serif
              </p>
              <p className="text-2xl">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
              <p className="text-2xl">abcdefghijklmnopqrstuvwxyz</p>
              <p className="text-2xl">0123456789 ()[]{`{}`}.,;:!?@#$%^&*</p>
            </div>
          </SubSection>

          <SubSection title="Size scale">
            <div className="space-y-3">
              {TYPOGRAPHY_SCALE.map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[120px_1fr] items-baseline gap-4 border-b border-border pb-3"
                >
                  <code className="text-xs text-muted-foreground">{row.name}</code>
                  <span className={row.name}>{row.sample}</span>
                </div>
              ))}
            </div>
          </SubSection>

          <SubSection title="Weights">
            <div className="space-y-3">
              {FONT_WEIGHTS.map((row) => (
                <div
                  key={row.name}
                  className="grid grid-cols-[120px_60px_1fr] items-baseline gap-4 border-b border-border pb-3"
                >
                  <code className="text-xs text-muted-foreground">{row.name}</code>
                  <code className="text-xs text-muted-foreground">{row.value}</code>
                  <span className={`text-base ${row.name}`}>
                    The quick brown fox jumps over the lazy dog
                  </span>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        <Section title="02 · Color palette" id="colors">
          <SubSection title="Base tokens">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {COLOR_TOKENS.map((color) => (
                <ColorSwatch key={color.name} {...color} />
              ))}
            </div>
          </SubSection>

          <SubSection title="Sidebar tokens">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SIDEBAR_TOKENS.map((color) => (
                <ColorSwatch key={color.name} {...color} />
              ))}
            </div>
          </SubSection>

          <SubSection title="Chart series">
            <div className="grid grid-cols-5 gap-3">
              {CHART_TOKENS.map((name) => (
                <div key={name} className="space-y-2">
                  <div className={`h-16 border border-border bg-${name}`} />
                  <code className="block text-xs text-muted-foreground">{name}</code>
                </div>
              ))}
            </div>
          </SubSection>
        </Section>

        <Section title="03 · Radius & spacing" id="radius">
          <SubSection title="Border radius">
            <div className="flex flex-wrap items-end gap-4">
              {[
                'rounded-none',
                'rounded-sm',
                'rounded-md',
                'rounded-lg',
                'rounded-xl',
                'rounded-full',
              ].map((radius) => (
                <div key={radius} className="space-y-2 text-center">
                  <div className={`h-16 w-16 bg-foreground ${radius}`} />
                  <code className="block text-xs text-muted-foreground">{radius}</code>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Default <code className="bg-muted px-1">--radius: 0rem</code> — sharp edges.
            </p>
          </SubSection>
        </Section>

        <Section title="04 · Components" id="components">
          <SubSection title="Button">
            <div className="flex flex-wrap gap-3">
              <Button>Default</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" aria-label="Icon">
                ✕
              </Button>
              <Button disabled>Disabled</Button>
            </div>
          </SubSection>

          <SubSection title="Input">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="doc-email">Email</Label>
                <Input id="doc-email" type="email" placeholder="you@valbook.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doc-disabled">Disabled</Label>
                <Input id="doc-disabled" placeholder="Cannot edit" disabled />
              </div>
            </div>
          </SubSection>

          <SubSection title="Textarea">
            <div className="space-y-2">
              <Label htmlFor="doc-notes">Notes</Label>
              <Textarea id="doc-notes" placeholder="Multi-line input" rows={3} />
            </div>
          </SubSection>

          <SubSection title="Checkbox">
            <div className="flex items-center gap-2">
              <Checkbox id="doc-check" />
              <Label htmlFor="doc-check">Accept terms</Label>
            </div>
          </SubSection>

          <SubSection title="Badge">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="secondary">Secondary</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </SubSection>

          <SubSection title="Card">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Total Assets</CardTitle>
                  <CardDescription>Across all workspaces</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl">Rp 2,500,000,000</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Members</CardTitle>
                  <CardDescription>This workspace</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl">4</p>
                </CardContent>
              </Card>
            </div>
          </SubSection>

          <SubSection title="Skeleton">
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </SubSection>

          <SubSection title="Separator">
            <Separator />
            <p className="mt-2 text-xs text-muted-foreground">Horizontal divider above.</p>
          </SubSection>
        </Section>

        <Section title="05 · CSS variables reference" id="vars">
          <div className="border border-border bg-muted/30">
            <pre className="overflow-x-auto p-4 text-xs">{CSS_VARS_REFERENCE}</pre>
          </div>
        </Section>

        <footer className="mt-16 border-t border-border pt-6 text-xs text-muted-foreground">
          <p>
            Source: <code className="bg-muted px-1">apps/web/app/globals.css</code>
          </p>
          <p className="mt-1">
            Stack: Next.js 16 · React 19 · Tailwind v4 · shadcn/ui · Geist Mono
          </p>
        </footer>
      </div>
    </main>
  );
}

function Section({
  title,
  id,
  children,
}: {
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mb-16">
      <h2 className="mb-6 text-xl uppercase tracking-wider">{title}</h2>
      <div className="space-y-8">{children}</div>
    </section>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 text-sm text-muted-foreground uppercase tracking-wider">{title}</h3>
      {children}
    </div>
  );
}

function ColorSwatch({ name, token, text }: { name: string; token: string; text: string }) {
  return (
    <div className="border border-border">
      <div className={`h-20 flex items-center justify-center ${token} ${text}`}>
        <code className="text-xs">Aa</code>
      </div>
      <div className="border-t border-border bg-card p-2">
        <code className="text-xs text-foreground">{name}</code>
      </div>
    </div>
  );
}

const CSS_VARS_REFERENCE = `:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --popover: #ffffff;
  --popover-foreground: #0a0a0a;
  --primary: #737373;
  --primary-foreground: #fafafa;
  --secondary: #f5f5f5;
  --secondary-foreground: #171717;
  --muted: #f5f5f5;
  --muted-foreground: #717171;
  --accent: #f5f5f5;
  --accent-foreground: #171717;
  --destructive: #e7000b;
  --destructive-foreground: #f5f5f5;
  --border: #e5e5e5;
  --input: #e5e5e5;
  --ring: #a1a1a1;
  --radius: 0rem;
  --font-sans: var(--font-geist-mono), monospace;
  --font-mono: var(--font-geist-mono), monospace;
  --font-serif: var(--font-geist-mono), monospace;
}

.dark {
  --background: #0a0a0a;
  --foreground: #fafafa;
  --card: #191919;
  --card-foreground: #fafafa;
  --primary: #737373;
  --primary-foreground: #fafafa;
  --secondary: #262626;
  --secondary-foreground: #fafafa;
  --muted: #262626;
  --muted-foreground: #a1a1a1;
  --accent: #404040;
  --accent-foreground: #fafafa;
  --destructive: #ff6467;
  --destructive-foreground: #262626;
  --border: #383838;
  --input: #525252;
  --ring: #737373;
}`;
