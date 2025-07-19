'use client';

import { useAtom } from 'jotai/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

import LoadingIndicator from '@/components/bid-details/components/loading';
import { userSessionAtom } from '@/lib/atoms';
import { logout } from '@/lib/session-manager';

export const UserLogoutHandler = () => {
  const [userSession, setUserSession] = useAtom(userSessionAtom);
  const router = useRouter();
  const hasLoggedOutRef = useRef(false);

  const isLoggedIn = userSession.user !== null;

  // Always log out and redirect to home page, with message
  useEffect(() => {
    if (isLoggedIn && !hasLoggedOutRef.current) {
      // Clear session storage
      logout();

      // Clear Jotai atom
      setUserSession({ user: null, loginTimestamp: null });
      hasLoggedOutRef.current = true;
    }
    if (!isLoggedIn) {
      toast.warning('You have been logged out. Redirecting to home page...', {
        duration: 2000,
        onDismiss: () => router.push('/'),
        id: 'logout-warning',
      });
      // Fallback redirect in case toast is not dismissed
      const timer = setTimeout(() => router.push('/'), 2200);
      return () => clearTimeout(timer);
    }
  }, [isLoggedIn, setUserSession, router]);

  return <LoadingIndicator />;
};
