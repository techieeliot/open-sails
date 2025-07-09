import { atom } from 'jotai';
import { Collection, User } from '@/types';

interface UserSession {
  user: User | null;
  loginTimestamp: string | null;
}

export const userSessionAtom = atom<UserSession>({
  user: null,
  loginTimestamp: null,
});

export const collectionsAtom = atom<Collection[]>([]);
