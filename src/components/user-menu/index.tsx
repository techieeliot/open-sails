'use client';

import { useAtomValue } from 'jotai';
import { LogIn, LogOut, Rocket, Settings, User } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { userSessionAtom } from '@/lib/atoms';

export const UserMenu = () => {
  // Simulate authentication state
  const userSession = useAtomValue(userSessionAtom);
  const { user: isLoggedIn } = userSession;

  const path = usePathname();
  return (
    <nav className="static md:fixed bottom-0 left-0 right-0 w-full z-50  flex items-center justify-around min-w-xs h-20 md:px-12 gap-8 overscroll-y-none [&>a]:flex [&>a]:flex-col [&>a]:items-center [&>a]:justify-center">
      <Link href="/dashboard">
        <Rocket className="mr-2" />
        <span className="text-xs hidden md:inline md:text-base">Dashboard</span>
      </Link>
      {isLoggedIn ? (
        <>
          <Link href="/profile" className="hidden md:inline">
            <User className="mr-2" />
            <span className="text-xs md:inline md:text-base">Profile</span>
          </Link>
          <Link href="/settings" className="inline">
            <Settings className="mr-2" />
            <span className="text-xs md:inline md:text-base">Settings</span>
          </Link>
          <Link href="/logout" className="inline">
            <LogOut className="mr-2" />
            <span className="text-xs md:inline md:text-base">Logout</span>
          </Link>
        </>
      ) : (
        path !== '/login' && (
          <Link href="/login" className="hidden md:inline">
            <LogIn className="mr-2" />
            <span className="text-xs md:inline md:text-base">Login</span>
          </Link>
        )
      )}
    </nav>
  );
};
