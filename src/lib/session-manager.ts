'use client';

import { useCallback, useEffect, useState } from 'react';
import { useIdleTimer } from 'react-idle-timer';

import type { User } from '@/types';

// Session configuration
const SESSION_DURATION = 45 * 60 * 1000; // 45 minutes
const WARNING_TIME = 40 * 60 * 1000; // 40 minutes
const SESSION_KEY = 'user_session';

// Session data interface
export interface SessionData {
  user: User;
  loginTimestamp: number;
  lastActivity: number;
}

// Session storage utilities - using localStorage for cross-tab persistence
const sessionStorage = {
  get(): SessionData | null {
    if (typeof window === 'undefined') return null;

    try {
      const data = window.localStorage.getItem(SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  set(data: SessionData): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(data));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(SESSION_KEY);
  },

  isValid(): boolean {
    const session = this.get();
    if (!session) return false;

    const now = Date.now();
    return now - session.lastActivity < SESSION_DURATION;
  },

  updateActivity(): void {
    const session = this.get();
    if (session) {
      session.lastActivity = Date.now();
      this.set(session);
    }
  },
};

// Hook options interface
interface UseSessionManagerProps {
  onSessionExpired: () => void;
  onSessionWarning: () => void;
  onUserActive?: () => void;
}

// Main session manager hook
export const useSessionManager = ({
  onSessionExpired,
  onSessionWarning,
  onUserActive,
}: UseSessionManagerProps) => {
  const [showWarning, setShowWarning] = useState(false);
  const [warningShown, setWarningShown] = useState(false);

  // Reset warning state when user is active
  const handleActivity = useCallback(() => {
    sessionStorage.updateActivity();
    if (showWarning) {
      setShowWarning(false);
      setWarningShown(false);
    }
    onUserActive?.();
  }, [showWarning, onUserActive]);

  // Handle when user becomes idle (40 minutes)
  const handleIdle = useCallback(() => {
    if (!warningShown && sessionStorage.isValid()) {
      setShowWarning(true);
      setWarningShown(true);
      onSessionWarning();
    }
  }, [warningShown, onSessionWarning]);

  // Configure idle timer
  const idleTimer = useIdleTimer({
    onIdle: handleIdle,
    onActive: handleActivity,
    timeout: WARNING_TIME, // 40 minutes
    throttle: 500,
    crossTab: true,
    syncTimers: 200,
  });

  // Check session validity on mount and periodically
  useEffect(() => {
    const checkSession = () => {
      if (!sessionStorage.isValid()) {
        sessionStorage.clear();
        onSessionExpired();
      }
    };

    // Check immediately
    checkSession();

    // Check every minute
    const interval = setInterval(checkSession, 60000);
    return () => clearInterval(interval);
  }, [onSessionExpired]);

  // Final timeout after warning (5 minutes after warning = 45 minutes total)
  useEffect(() => {
    let finalTimeout: NodeJS.Timeout;

    if (showWarning) {
      finalTimeout = setTimeout(
        () => {
          sessionStorage.clear();
          onSessionExpired();
        },
        5 * 60 * 1000,
      ); // 5 minutes after warning
    }

    return () => {
      if (finalTimeout) {
        clearTimeout(finalTimeout);
      }
    };
  }, [showWarning, onSessionExpired]);

  return {
    showWarning,
    remainingTime: idleTimer.getRemainingTime(),
    isIdle: idleTimer.isIdle(),
    reset: idleTimer.reset,
    activate: idleTimer.activate,
    extendSession: () => {
      sessionStorage.updateActivity();
      setShowWarning(false);
      setWarningShown(false);
      idleTimer.reset();
    },
  };
};

// Utility functions for login/logout
export const login = (user: User): void => {
  const now = Date.now();
  const sessionData: SessionData = {
    user,
    loginTimestamp: now,
    lastActivity: now,
  };
  sessionStorage.set(sessionData);
};

export const logout = (): void => {
  sessionStorage.clear();
};

export const getCurrentUser = (): User | null => {
  const session = sessionStorage.get();
  if (!session) return null;

  // Check if session is still valid
  if (!sessionStorage.isValid()) {
    sessionStorage.clear();
    return null;
  }

  return session.user;
};

export const isLoggedIn = (): boolean => {
  return sessionStorage.isValid();
};

// Debug function to check session state from browser console
export const debugSession = () => {
  if (typeof window === 'undefined') {
    console.log('Not in browser environment');
    return;
  }

  const session = sessionStorage.get();
  console.log('=== Session Debug Info ===');
  console.log('Raw localStorage:', window.localStorage.getItem(SESSION_KEY));
  console.log('Parsed session:', session);
  console.log('Is valid:', sessionStorage.isValid());
  console.log('Current user:', getCurrentUser());
  console.log('Is logged in:', isLoggedIn());

  if (session) {
    const now = Date.now();
    const timeElapsed = now - session.lastActivity;
    const timeRemaining = SESSION_DURATION - timeElapsed;
    console.log('Time elapsed (minutes):', Math.floor(timeElapsed / 60000));
    console.log('Time remaining (minutes):', Math.floor(timeRemaining / 60000));
  }

  console.log('========================');
};
