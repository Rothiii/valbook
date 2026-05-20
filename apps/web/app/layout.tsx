import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';

import { ThemeProvider } from '@/src/shared/lib/theme-provider';
import { TRPCProvider } from '@/src/shared/lib/trpc-provider';
import { Toaster } from '@/src/shared/ui/sonner';

import './globals.css';

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Valbook',
  description: 'Collaborative Asset Workspace Platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider>{children}</TRPCProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
