import { COLLECTIONS_PATH } from '@/lib/constants';
import { Collection } from '@/types';
import { fetchDataByPath, setDataByPath } from '../utils';

export async function getCollections(): Promise<Collection[]> {
  return fetchDataByPath(COLLECTIONS_PATH);
}

export async function saveCollections(collections: Collection[]) {
  return setDataByPath(COLLECTIONS_PATH, collections);
}

export async function getCollectionById(id: number): Promise<Collection | null> {
  const collections = await getCollections();
  return collections.find((c) => c.id === id) || null;
}

export async function createCollection(collection: any): Promise<Collection> {
  const collections = await getCollections();
  const newId = collections.length ? Math.max(...collections.map((c) => c.id)) + 1 : 1;
  const newCollection: Collection = {
    ...collection,
    id: newId,
    status: 'open',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  collections.unshift(newCollection);
  await saveCollections(collections);
  return newCollection;
}

export async function updateCollection(
  id: number,
  updatedData: Partial<Collection>,
): Promise<Collection> {
  const collections = await getCollections();
  const collectionIndex = collections.findIndex((c) => c.id === id);

  if (collectionIndex === -1) {
    throw new Error('Collection not found');
  }

  const updatedCollection: Collection = {
    ...collections[collectionIndex],
    ...updatedData,
    updatedAt: new Date().toISOString(),
  };

  collections[collectionIndex] = updatedCollection;
  await saveCollections(collections);
  return updatedCollection;
}

export async function deleteCollection(id: number): Promise<void> {
  const collections = await getCollections();
  const updatedCollections = collections.filter((c) => c.id !== id);

  if (updatedCollections.length === collections.length) {
    throw new Error('Collection not found');
  }

  await saveCollections(updatedCollections);
}
