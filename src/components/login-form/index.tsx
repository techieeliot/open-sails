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
  const setUserSession = useSetAtom(userSessionAtom);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/users');
        if (!response.ok) {
          throw new Error(`Failed to fetch users: ${response.status}`);
        }
        const userData: User[] = await response.json();
        // Ensure userData is an array before setting
        if (Array.isArray(userData)) {
          setUsers(userData);
        } else {
          throw new Error('Received invalid data format for users');
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setError(error instanceof Error ? error.message : 'Failed to load users');
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

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

  return (
    <section className="flex flex-col items-center gap-4">
      <p className="text-lg">Please select a user to log in and continue</p>

      {error && <div className="text-red-600 text-sm">Error: {error}</div>}

      {loading ? (
        <div className="text-gray-600">Loading users...</div>
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
            <option value="">{users.length === 0 ? 'No users available' : 'Select User'}</option>
            {/* Map over users from the database and create an option for each */}
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline" disabled={users.length === 0}>
            Log in
          </Button>
        </form>
      )}
    </section>
  );
};
