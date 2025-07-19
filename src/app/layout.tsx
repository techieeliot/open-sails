import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import AppFooter from '@/components/app-footer';
import BottomNavigation from '@/components/bottom-navigation';
import ErrorBoundary from '@/components/error-boundary';
import HeaderNavigation from '@/components/header-navigation.tsx';
import JotaiProvider from '@/components/providers/jotai-provider';
import { SessionProvider } from '@/components/session-provider';
import { cn } from '@/lib/utils';

import { Analytics } from '@vercel/analytics/next';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Open Sails',
  description: 'A platform for managing bids and collections',
  icons: {
    icon: '/favicon.ico',
  },
  keywords: ['bids', 'collections', 'cryptocurrency', 'platform', 'crypto mining', 'decentralized'],
  authors: [{ name: 'Eliot Sanford', url: 'https://github.com/techieeliot' }],
  creator: 'Eliot Sanford',
  openGraph: {
    title: 'Open Sails',
    description: 'A platform for managing bids and collections',
    url: 'https://open-sails.vercel.app/',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  themeColor: '#ffee37',
  appleWebApp: {
    capable: true,
    title: 'Open Sails',
    statusBarStyle: 'black-translucent',
  },
  formatDetection: {
    telephone: false,
  },
  metadataBase: new URL('https://open-sails.vercel.app/'),
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const revalidate = 60;
export const runtime = 'edge';

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className={cn(geistSans.variable, geistMono.variable, 'antialiased', 'dark')}
      >
        <ErrorBoundary>
          <JotaiProvider>
            <SessionProvider>
              <HeaderNavigation />
              {/* PAGE CONTENT */}
              <div className="pb-20 md:pb-0">
                {children}
                <AppFooter />
              </div>
              <BottomNavigation />
            </SessionProvider>
          </JotaiProvider>
        </ErrorBoundary>
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
