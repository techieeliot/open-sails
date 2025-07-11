'use client';

import { userSessionAtom } from '@/lib/atoms';
import { useSetAtom } from 'jotai';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const LogoutHandler = () => {
  const setUserSession = useSetAtom(userSessionAtom);
  const router = useRouter();

  useEffect(() => {
    const handleLogout = () => {
      setUserSession({ user: null, loginTimestamp: null });
      router.push('/login');
    };
    handleLogout();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center h-screen">Logging you out...</div>
  );
};
