import type { Metadata } from 'next';
import Image from 'next/image';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={cn(geistSans.variable, geistMono.variable, 'antialiased', 'dark')}>
        {/* Top Navigation */}
        <header className="fixed w-full z-50">
          <div className="flex items-center justify-between shadow-md">
            <div className="min-w-xl">
              <nav className="flex items-center px-12 h-20">
                <Link
                  href="/"
                  className="text-2xl font-bold w-2xs flex items-center justify-center"
                >
                  Open Sails
                </Link>
                <Link href="/dashboard" className="text-lg font-semibold">
                  Dashboard
                </Link>
              </nav>
            </div>
            <div className="flex items-center justify-around min-w-3xs h-20 px-12">
              <Link href="/" className="flex items-center w-12 h-12">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <Image src="/logo.png" alt="Logo" width={30} height={30} />
                </div>
              </Link>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        {children}

        <footer className="flex items-center justify-center p-4 shadow-md">
          <Image src="/logo.png" alt="Footer Logo" width={30} height={30} />
        </footer>
      </body>
    </html>
  );
}
