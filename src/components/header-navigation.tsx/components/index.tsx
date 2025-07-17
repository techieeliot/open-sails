'use client';

import { useAtomValue } from 'jotai';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from '@/components/user-menu';
import { userSessionAtom } from '@/lib/atoms';

export const MainHeaderNav = () => (
  <div className="flex items-center justify-between shadow-md">
    <div className="min-w-xl">
      <nav className="hidden md:flex items-center md:px-12 h-20">
        <Link href="/" className="text-2xl font-bold flex items-center justify-center">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-auto w-auto" />
          </div>
          <span className="hidden md:inline min-w-32">Open Sails</span>
        </Link>
      </nav>
    </div>

    <UserMenu />
  </div>
);

export const ResponsiveHeaderNavigation = () => {
  // Simulate authentication state
  const userSession = useAtomValue(userSessionAtom);
  const { user } = userSession;
  const path = usePathname();
  return (
    <nav className="md:hidden flex justify-between p-0 h-20 w-full">
      {user ? (
        <>
          <Link href="/profile" className="inline md:hidden">
            <User className="mr-2" />
            <span className="text-xs md:inline md:text-base">Profile</span>
          </Link>
          <Link href="/" className="inline md:hidden">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-auto w-auto" />
          </Link>
          <Link href="/logout" className="inline md:hidden">
            <LogOut className="mr-2" />
            <span className="text-xs md:inline md:text-base">Logout</span>
          </Link>
        </>
      ) : (
        path !== '/' && (
          <Link href="/" className="inline md:hidden">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-auto w-auto" />
          </Link>
        )
      )}
    </nav>
  );
};
