'use client';

import { useAtomValue } from 'jotai';
import { LockOpen } from 'lucide-react';
import Link from 'next/link';
import { userSessionAtom } from '@/lib/atoms';

export const UserAccessSwitcher = () => {
  const userSession = useAtomValue(userSessionAtom);
  const isLoggedIn = userSession.user;

  return (
    <section className="flex flex-col items-center justify-center gap-8">
      <Link
        href={isLoggedIn ? '/dashboard' : '/login'}
        className="text-2xl font-semibold flex items-baseline justify-center"
      >
        <LockOpen className="mr-2 animate-pulse duration-1000" />
        {isLoggedIn ? 'Open Dashboard' : 'Login to your account'}
      </Link>
    </section>
  );
};
