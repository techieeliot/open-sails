'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';

// Extend the Window interface to include debugSession
declare global {
  interface Window {
    debugSession?: typeof debugSession;
  }
}

import {
  useSessionManager,
  isLoggedIn as checkSessionStorageLogin,
  debugSession,
} from '@/lib/session-manager';
import { userSessionAtom } from '@/lib/atoms';
import { SessionWarningDialog } from '@/components/session-warning-dialog';
import { SessionRestorer } from '@/components/session-restorer';

interface SessionProviderProps {
  children: React.ReactNode;
}

export const SessionProvider = ({ children }: SessionProviderProps) => {
  const router = useRouter();
  const [userSession, setUserSession] = useAtom(userSessionAtom);

  const { showWarning, remainingTime, isIdle, reset, activate, extendSession } = useSessionManager({
    onSessionExpired: useCallback(() => {
      console.log('Session expired - logging out');
      setUserSession({ user: null, loginTimestamp: null });
      router.push('/');
    }, [setUserSession, router]),

    onSessionWarning: useCallback(() => {
      console.log('Session warning triggered');
      // Warning dialog is controlled by the showWarning state
    }, []),
  });

  // Check if user is logged in (from both atom and sessionStorage)
  const isLoggedIn = userSession.user !== null;
  const hasValidSession = checkSessionStorageLogin();

  // Initialize session on mount if there's a valid session in sessionStorage
  useEffect(() => {
    if (hasValidSession) {
      console.log('Activating session manager - valid session found');
      activate();
    }
  }, [hasValidSession, activate]);

  // Add debug function to global window object for testing
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as Window & typeof globalThis).debugSession = debugSession;
    }
  }, []);

  const handleExtendSession = useCallback(() => {
    console.log('Extending session');
    extendSession();
  }, [extendSession]);

  const handleLogout = useCallback(() => {
    console.log('Manual logout from session warning');
    setUserSession({ user: null, loginTimestamp: null });
    router.push('/');
  }, [setUserSession, router]);

  return (
    <>
      <SessionRestorer />
      {children}

      <SessionWarningDialog
        isOpen={showWarning && isLoggedIn}
        onExtendSession={handleExtendSession}
        onLogout={handleLogout}
        remainingTime={remainingTime}
      />
    </>
  );
};
