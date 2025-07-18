import Redis from 'ioredis';

import { getBidsByCollectionId } from '@/app/api/bids/utils';
import { getCollectionById } from '@/app/api/collections/utils';
import type { Collection } from '@/types';

import logger from './logger';
import { getErrorMessage } from './utils';

const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

const COLLECTION_TTL = 60; // seconds

export async function getCollectionWithCache(collectionId: number) {
  const cacheKey = `collections:${collectionId}`;
  const cached = await redis.get(cacheKey);
  logger.info(
    { collectionId, type: 'collection_cache_check' },
    `Checking cache for collection: ${collectionId}`,
  );
  if (cached) return JSON.parse(cached);

  const collection = await getCollectionFromDB(collectionId); // your DB fetch
  if (collection) await redis.set(cacheKey, JSON.stringify(collection), 'EX', COLLECTION_TTL);

  logger.info({ collectionId, type: 'collection_cache_set' }, `Cached collection: ${collectionId}`);
  return collection;
}

export async function getBidsWithCache(collectionId: number) {
  const cacheKey = `bids:${collectionId}`;
  const cached = await redis.get(cacheKey);
  logger.info(
    { collectionId, type: 'bids_cache_check' },
    `Checking cache for bids of collection: ${collectionId}`,
  );
  if (cached) return JSON.parse(cached);

  const bids = await getBidsByCollectionId(collectionId); // your DB fetch
  if (bids) await redis.set(cacheKey, JSON.stringify(bids), 'EX', COLLECTION_TTL);

  logger.info(
    { collectionId, type: 'bids_cache_set' },
    `Cached bids for collection: ${collectionId}`,
  );
  return bids;
}

export async function invalidateBidAndCollectionCache(collectionId: number, userId?: number) {
  const keys = [`collections:${collectionId}`, `bids:${collectionId}`];
  if (userId) keys.push(`users:${userId}:bids`);
  try {
    logger.info(
      { collectionId, userId, type: 'cache_invalidation' },
      `Invalidating cache for collection: ${collectionId}, user: ${userId}`,
    );
    await redis.del(...keys);
    logger.info(
      { collectionId, userId, type: 'cache_invalidation' },
      `Invalidated cache for collection: ${collectionId}, user: ${userId}`,
    );
  } catch (error) {
    logger.error(
      { collectionId, userId, error: getErrorMessage(error), type: 'cache_invalidation_error' },
      `Failed to invalidate cache for collection: ${collectionId}, user: ${userId}`,
    );
  }
}

async function getCollectionFromDB(collectionId: number): Promise<Collection | null> {
  try {
    logger.info(
      { collectionId, type: 'collection_fetch' },
      `Fetching collection from DB: ${collectionId}`,
    );
    const collection = await getCollectionById(collectionId);
    if (!collection) {
      logger.warn(
        { collectionId, type: 'collection_not_found' },
        `Collection not found in DB: ${collectionId}`,
      );
    } else {
      logger.error(
        { collectionId, type: 'collection_not_found_error' },
        `Collection not found in DB: ${collectionId}`,
      );
    }
    return collection;
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    logger.error(
      { collectionId, error: errorMessage, type: 'collection_fetch_error' },
      `Failed to fetch collection from DB: ${errorMessage}`,
    );
    return null;
  }
}

export default redis;
