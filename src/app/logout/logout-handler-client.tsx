'use client';

import { useAtom } from 'jotai/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import LoadingIndicator from '@/components/bid-details/components/loading';
import { userSessionAtom } from '@/lib/atoms';

export const UserLogoutHandler = () => {
  const [userSession, setUserSession] = useAtom(userSessionAtom);
  const router = useRouter();
  const hasLoggedOutRef = useRef(false);

  const isLoggedIn = userSession.user !== null;

  // Always log out and redirect to home page, with message
  useEffect(() => {
    if (isLoggedIn && !hasLoggedOutRef.current) {
      setUserSession({ user: null, loginTimestamp: null });
      hasLoggedOutRef.current = true;
    }
    if (!isLoggedIn) {
      toast.warning('You have been logged out. Redirecting to home page...', {
        duration: 2000,
        onDismiss: () => router.push('/'),
      });
      // Fallback redirect in case toast is not dismissed
      const timer = setTimeout(() => router.push('/'), 2200);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, setUserSession, router]);

  // Show loading indicator while processing logout
  if (isLoggedIn) {
    return <LoadingIndicator />;
  }

  // Show message before redirect
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold">You're logged out.</h1>
      <p className="mt-2">Redirecting to home page...</p>
    </div>
  );
};
