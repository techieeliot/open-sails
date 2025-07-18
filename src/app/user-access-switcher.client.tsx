'use client';

import { useAtomValue } from 'jotai';
import { LogIn, Rocket } from 'lucide-react';
import Link from 'next/link';

import { userSessionAtom } from '@/lib/atoms';
import { Button } from '@/components/ui/button';

export const UserAccessSwitcher = () => {
  const userSession = useAtomValue(userSessionAtom);
  const isLoggedIn = userSession.user;

  return (
    <section className="flex flex-col items-center justify-center gap-8">
      <Button asChild>
        <Link
          href={isLoggedIn ? '/dashboard' : '/login'}
          className="inline-flex items-center justify-center font-semibold text-2xl"
        >
          {isLoggedIn ? (
            <>
              <Rocket className="mr-2 animate-pulse duration-1000" />
              Open Dashboard
            </>
          ) : (
            <>
              <LogIn className="mr-2 animate-pulse duration-1000" />
              Login to your account
            </>
          )}
        </Link>
      </Button>
    </section>
  );
};
