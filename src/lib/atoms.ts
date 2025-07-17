import { parseISO, compareAsc } from 'date-fns';
import { atom, createStore } from 'jotai';
import { Bid, Collection, User } from '@/types';

// Session state
export const userSessionAtom = atom<{ user: User | null; loginTimestamp: string | null }>({
  user: null,
  loginTimestamp: null,
});

// Collections state
export const collectionsAtom = atom<Collection[]>([]);
export const expandedCollectionAtom = atom<number | null>(null);
export const collectionsLoadingAtom = atom<boolean>(false);
export const collectionsErrorAtom = atom<string | null>(null);

// Bids state
export const bidsAtom = atom<Bid[]>([]);
export const bidsLoadingAtom = atom<boolean>(false);
export const bidsErrorAtom = atom<string | null>(null);

// User names cache
export const userNamesAtom = atom<Record<string, string>>({});

// Derived atoms
export const openCollectionsAtom = atom((get) =>
  get(collectionsAtom).filter((c) => c.status === 'open'),
);
export const userLoginStatusAtom = atom((get) => {
  const session = get(userSessionAtom);
  return session.user !== null;
});
export const sortedCollectionsAtom = atom((get) => {
  const collections = get(collectionsAtom);
  return collections
    .slice()
    .sort((a, b) => compareAsc(parseISO(a.updatedAt), parseISO(b.updatedAt)));
});

// Custom store (optional, for SSR or advanced use)
export const jotaiStore = createStore();

export const useJotaiStore = () => {
  return jotaiStore;
};
