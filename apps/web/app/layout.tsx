import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';

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
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">
        <TRPCProvider>{children}</TRPCProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
