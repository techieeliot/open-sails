import { atom, createStore } from 'jotai';
import { Bid, Collection, User } from '@/types';

interface UserSession {
  user: User | null;
  loginTimestamp: string | null;
}

export const userSessionAtom = atom<UserSession>({
  user: null,
  loginTimestamp: null,
});

export const collectionsAtom = atom<Collection[]>([]);
export const bidsAtom = atom<Bid[]>([]);

// Create a proper Jotai store instance
export const jotaiStore = createStore();

// Initialize the store with our atoms
jotaiStore.set(userSessionAtom, { user: null, loginTimestamp: null });
jotaiStore.set(collectionsAtom, []);
jotaiStore.set(bidsAtom, []);
