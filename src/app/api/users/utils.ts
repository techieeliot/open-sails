import { UserService } from '@/lib/db-service';
import { User, NewUser } from '@/types';

export async function getUsers(): Promise<User[]> {
  return await UserService.findAll();
}

export async function getUserById(id: number): Promise<User | null> {
  return await UserService.findById(id);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return await UserService.findByEmail(email);
}

export async function createUser(userData: Omit<NewUser, 'id'>): Promise<User> {
  return await UserService.create(userData);
}

export async function updateUser(
  id: number,
  userData: Partial<Omit<NewUser, 'id'>>,
): Promise<User> {
  return await UserService.update(id, userData);
}

export async function deleteUser(id: number): Promise<void> {
  await UserService.delete(id);
}
