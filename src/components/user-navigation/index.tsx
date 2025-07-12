'use client';

import { userSessionAtom } from '@/lib/atoms';
import { useAtomValue } from 'jotai';
import { LayoutDashboard, LogIn, LogOut, Settings, User } from 'lucide-react';
import Link from 'next/link';

export const UserMenu = () => {
  // Simulate authentication state
  const userSession = useAtomValue(userSessionAtom);
  return (
    <nav className="flex items-center justify-around min-w-xs h-20 px-12 gap-8">
      <Link href="/dashboard">
        <LayoutDashboard className="mr-2" />
        <span className="hidden md:inline">Dashboard</span>
      </Link>
      {userSession.user ? (
        <>
          <Link href="/profile">
            <User className="mr-2" />
            <span className="hidden md:inline">Profile</span>
          </Link>
          <Link href="/settings">
            <Settings className="mr-2" />
            <span className="hidden md:inline">Settings</span>
          </Link>
          <Link href="/logout">
            <LogOut className="mr-2" />
            <span className="hidden md:inline">Logout</span>
          </Link>
        </>
      ) : (
        <Link href="/login">
          <LogIn className="mr-2" />
          <span className="hidden md:inline">Login</span>
        </Link>
      )}
    </nav>
  );
};
