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
  const setUserSession = useSetAtom(userSessionAtom);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const response = await fetch('/api/users');
      const userData: User[] = await response.json();
      setUsers(userData);
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
      <form onSubmit={handleLogin} className="flex flex-col items-center gap-4">
        {/* dropdown for the user id from the db users.json */}
        <label className="text-sm font-medium" htmlFor="userId">
          User:
        </label>
        <select className="p-2 border border-gray-300 rounded" name="userId" required>
          <option value="">Select User</option>
          {/* Map over users from the database and create an option for each */}
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <Button type="submit" variant="outline">
          Log in
        </Button>
      </form>
    </section>
  );
};
