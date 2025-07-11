import { CollectionService } from '@/lib/db-service';
import { Collection, NewCollection } from '@/types';

export async function getCollections(): Promise<Collection[]> {
  return await CollectionService.findAll();
}

export async function getCollectionById(id: number): Promise<Collection | null> {
  return await CollectionService.findById(id);
}

export async function createCollection(
  collectionData: Omit<NewCollection, 'id'>,
): Promise<Collection> {
  return await CollectionService.create(collectionData);
}

export async function updateCollection(
  id: number,
  updatedData: Partial<Omit<NewCollection, 'id'>>,
): Promise<Collection> {
  return await CollectionService.update(id, updatedData);
}

export async function deleteCollection(id: number): Promise<void> {
  await CollectionService.delete(id);
}

// Get collections with owner information for enhanced data
export async function getCollectionsWithOwner() {
  return await CollectionService.findAllWithOwner();
}
