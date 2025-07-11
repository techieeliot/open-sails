// Filepath: src/components/login-form/index.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { User } from '@/types';
import { useSetAtom } from 'jotai';
import { userSessionAtom } from '@/lib/atoms';
import { useRouter } from 'next/navigation';

export const LoginForm = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const setUserSession = useSetAtom(userSessionAtom);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log('Fetching users from API...');
        const response = await fetch('/api/users');

        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error response:', errorText);
          throw new Error(`Failed to fetch users: ${response.status} - ${errorText}`);
        }

        const userData: User[] = await response.json();
        console.log('Received user data:', userData);

        // Ensure userData is an array before setting
        if (Array.isArray(userData)) {
          setUsers(userData);
          console.log(`Successfully loaded ${userData.length} users`);
        } else {
          console.error('Invalid data format received:', userData);
          throw new Error('Received invalid data format for users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load users';
        setError(errorMessage);
        setUsers([]);

        // Auto-retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          console.log(
            `Retrying in ${(retryCount + 1) * 2} seconds... (attempt ${retryCount + 1}/3)`,
          );
          setTimeout(
            () => {
              setRetryCount((prev) => prev + 1);
            },
            (retryCount + 1) * 2000,
          );
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [retryCount]);

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const userId = formData.get('userId');
    const selectedUser = users.find((user) => user.id === Number(userId));

    if (selectedUser) {
      setUserSession({
        user: selectedUser,
        loginTimestamp: new Date().toISOString(),
      });
      router.push('/dashboard');
    }
  };

  const handleManualRetry = () => {
    setRetryCount(0);
    setError(null);
    setRetryCount((prev) => prev + 1);
  };

  return (
    <section className="flex flex-col items-center gap-4">
      <p className="text-lg">Please select a user to log in and continue</p>

      {error && (
        <div className="p-4 border border-red-300 rounded-lg bg-red-50 text-red-700 max-w-md">
          <div className="font-medium mb-2">Connection Error</div>
          <div className="text-sm mb-3">{error}</div>
          {retryCount < 3 && (
            <div className="text-xs text-red-600 mb-2">
              Auto-retrying... (attempt {retryCount + 1}/3)
            </div>
          )}
          <Button size="sm" variant="outline" onClick={handleManualRetry} disabled={loading}>
            Retry Now
          </Button>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="text-gray-600">Loading users...</div>
          {retryCount > 0 && (
            <div className="text-sm text-gray-500">Retry attempt {retryCount}/3</div>
          )}
        </div>
      ) : (
        <form onSubmit={handleLogin} className="flex flex-col items-center gap-4">
          {/* dropdown for the user id from the db users.json */}
          <label className="text-sm font-medium" htmlFor="userId">
            User:
          </label>
          <select
            className="p-2 border border-gray-300 rounded"
            name="userId"
            required
            disabled={users.length === 0}
          >
            <option value="">
              {users.length === 0
                ? 'No users available'
                : `Select User (${users.length} available)`}
            </option>
            {/* Map over users from the database and create an option for each */}
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline" disabled={users.length === 0}>
            Log in
          </Button>

          {users.length === 0 && !loading && !error && (
            <div className="text-sm text-gray-500 text-center max-w-md">
              <p>Unable to load user list. This might be a temporary issue.</p>
              <Button size="sm" variant="outline" onClick={handleManualRetry} className="mt-2">
                Try Again
              </Button>
            </div>
          )}
        </form>
      )}
    </section>
  );
};
