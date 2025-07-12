'use client';

import { userSessionAtom } from '@/lib/atoms';
import { useAtomValue } from 'jotai';
import { LockOpen } from 'lucide-react';
import Link from 'next/link';

export const UserAccessSwitcher = () => {
  const { user } = useAtomValue(userSessionAtom);
  return (
    <section className="flex flex-col items-center justify-center gap-8">
      <Link
        href={user ? '/dashboard' : '/login'}
        className="text-2xl font-semibold flex items-baseline justify-center"
      >
        <LockOpen className="mr-2 animate-pulse duration-1000" />
        {user ? 'Open Dashboard' : 'Login to your account'}
      </Link>
    </section>
  );
};
