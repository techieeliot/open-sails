import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Analytics } from '@vercel/analytics/next';
import ErrorBoundary from '@/components/error-boundary';
import { Toaster } from 'sonner';
import TopNavigation from '@/components/top-navigation.tsx';
import Footer from '@/components/footer';
import JotaiProvider from '@/components/providers/jotai-provider';
import { ReactNode } from 'react';

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
};

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
            <TopNavigation />
            {/* PAGE CONTENT */}
            {children}
            <Footer />
          </JotaiProvider>
        </ErrorBoundary>
        <Toaster position="top-center" richColors />
        <Analytics />
      </body>
    </html>
  );
}
