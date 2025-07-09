'use client';

import Link from 'next/link';
import { useState } from 'react';

export const UserNavigation = () => {
  // Simulate authentication state
  const [authenticated, setAuthenticated] = useState(true); // Change to false to simulate unauthenticated state
  return (
    <nav className="flex items-center justify-around min-w-xs h-20 px-12">
      <Link href="/dashboard" className="text-lg font-semibold">
        Dashboard
      </Link>
      {
        /* Authentication is optional, feel free to mock users */
        authenticated ? (
          <>
            <Link href="/profile" className="text-lg font-semibold">
              Profile
            </Link>
            <Link href="/settings" className="text-lg font-semibold">
              Settings
            </Link>
            <Link href="/logout" className="text-lg font-semibold">
              Logout
            </Link>
          </>
        ) : (
          <Link href="/login" className="text-lg font-semibold">
            Login
          </Link>
        )
      }
    </nav>
  );
};
