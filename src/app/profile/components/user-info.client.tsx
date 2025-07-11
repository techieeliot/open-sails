'use client';

import { userSessionAtom } from '@/lib/atoms';
import { useAtomValue } from 'jotai';

export default function UserInfo() {
  const { user } = useAtomValue(userSessionAtom);

  if (!user) return <div>Loading user info...</div>;

  return (
    <div className="mt-4 p-4 border rounded">
      <div>
        <strong>Name:</strong> {user.name || 'N/A'}
      </div>
      <div>
        <strong>Email:</strong> {user.email || 'N/A'}
      </div>
    </div>
  );
}
