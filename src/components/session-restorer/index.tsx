'use client';

import { useEffect } from 'react';
import { useSetAtom } from 'jotai';

import { userSessionAtom } from '@/lib/atoms';
import { getCurrentUser, isLoggedIn } from '@/lib/session-manager';

/**
 * Component that restores user session from sessionStorage on app initialization
 */
export const SessionRestorer = () => {
  const setUserSession = useSetAtom(userSessionAtom);

  useEffect(() => {
    // Check if there's a valid session in sessionStorage
    if (isLoggedIn()) {
      const currentUser = getCurrentUser();

      if (currentUser) {
        console.log('Restoring session for user:', currentUser.name);
        setUserSession({
          user: currentUser,
          loginTimestamp: new Date().toISOString(),
        });
        return;
      }
    }

    // No valid session found
    console.log('No valid session found on page load');
    setUserSession({
      user: null,
      loginTimestamp: null,
    });
  }, [setUserSession, isLoggedIn]);

  return null; // This component does not render anything
};
