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
      <nav className="hidden h-20 items-center md:flex md:px-12">
        <Link href="/" className="flex items-center justify-center font-bold text-2xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-shadow duration-300 hover:shadow-lg dark:bg-gray-800">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-auto w-auto" />
          </div>
          <span className="hidden min-w-32 md:inline">Open Sails</span>
        </Link>
      </nav>
    </div>

    <UserMenu />
  </div>
);

export const ResponsiveHeaderNavigation = () => {
  const userSession = useAtomValue(userSessionAtom);
  const { user } = userSession;
  const path = usePathname();
  return (
    <nav className="flex h-16 w-full items-center justify-between px-4 bg-zinc-900 md:hidden shadow-sm">
      {user ? (
        <>
          <Link href="/profile" className="flex flex-col items-center justify-center">
            <User className="h-6 w-6 mb-1" />
            <span className="text-xs">Profile</span>
          </Link>
          <Link href="/" className="flex flex-col items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          </Link>
          <Link href="/logout" className="flex flex-col items-center justify-center">
            <LogOut className="h-6 w-6 mb-1" />
            <span className="text-xs">Logout</span>
          </Link>
        </>
      ) : (
        path !== '/' && (
          <Link href="/" className="flex flex-col items-center justify-center mx-auto">
            <Image
              src="/logo.png"
              alt="Logo"
              width={36}
              height={36}
              className="h-9 w-9 object-contain"
            />
          </Link>
        )
      )}
    </nav>
  );
};
