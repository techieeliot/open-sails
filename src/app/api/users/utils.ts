import { USERS_PATH } from '@/lib/contstants';
import { User } from '@/types';
import { fetchDataByPath } from '../utils';

export async function getUsers(): Promise<User[]> {
  return fetchDataByPath(USERS_PATH);
}

export async function getUserById(id: number): Promise<User | undefined> {
  const users = await getUsers();
  return users.find((u) => u.id === id);
}
