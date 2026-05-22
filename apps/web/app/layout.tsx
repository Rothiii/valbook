import type { Metadata } from 'next';
import { Geist_Mono } from 'next/font/google';
import Script from 'next/script';

import { ThemeProvider } from '@/src/shared/lib/theme-provider';
import { TRPCProvider } from '@/src/shared/lib/trpc-provider';
import { Toaster } from '@/src/shared/ui/sonner';

import './globals.css';

const themeInitScript = `(function(){try{var t=localStorage.getItem('valbook-theme')||'system';var d=t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;if(d)r.classList.add('dark');r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

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
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInitScript}
        </Script>
        <ThemeProvider defaultTheme="system">
          <TRPCProvider>{children}</TRPCProvider>
          <Toaster richColors closeButton position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
