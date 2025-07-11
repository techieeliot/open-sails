'use client';

import { userSessionAtom } from '@/lib/atoms';
import { useAtomValue } from 'jotai';
import Link from 'next/link';

export const UserAccessSwitcher = () => {
  const { user } = useAtomValue(userSessionAtom);
  return (
    <section className="flex flex-col items-center justify-center gap-8">
      {/* Authentication is optional (feel free to mock users), bonus if you can implement it. */}
      <Link href={user ? '/dashboard' : '/login'} className="text-xl font-semibold">
        Go to {user ? 'dashboard' : 'login'}
      </Link>
    </section>
  );
};
