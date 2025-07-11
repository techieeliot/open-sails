'use client';

import { userSessionAtom } from '@/lib/atoms';
import { useAtomValue } from 'jotai';
import Link from 'next/link';

export const UserNavigation = () => {
  // Simulate authentication state
  const userSession = useAtomValue(userSessionAtom);
  return (
    <nav className="flex items-center justify-around min-w-xs h-20 px-12">
      <Link href="/dashboard" className="text-lg font-semibold">
        Dashboard
      </Link>
      {userSession.user ? (
        <>
          <Link href="/profile" className="text-lg font-semibold">
            Profile
          </Link>
          <Link href="/settings" className="text-lg font-semibold">
            Settings
          </Link>
          <Link href="/logout" className="text-lg font-semibold">
            Logout
          </Link>
        </>
      ) : (
        <Link href="/login" className="text-lg font-semibold">
          Login
        </Link>
      )}
    </nav>
  );
};
