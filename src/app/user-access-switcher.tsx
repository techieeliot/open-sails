'use client';

import { userSessionAtom } from '@/lib/atoms';
import { useAtom, useAtomValue } from 'jotai';
import Link from 'next/link';
import { useState } from 'react';

export const UserAccessSwitcher = () => {
  const { user } = useAtomValue(userSessionAtom);
  return (
    <section className="flex flex-col items-center justify-center gap-8">
      {/* Authentication is optional (feel free to mock users), bonus if you can implement it. */}
      <Link href={user ? '/dashboard' : '/login'} className="text-lg font-semibold">
        Go to {user ? 'dashboard' : 'login'}
      </Link>
    </section>
  );
};
