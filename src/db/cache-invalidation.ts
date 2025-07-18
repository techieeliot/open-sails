import redis from '@/lib/redis';

export async function invalidateBidAndCollectionCache(collectionId: number, userId?: number) {
  const keys = [`collections:${collectionId}`, `bids:${collectionId}`];
  if (userId) keys.push(`users:${userId}:bids`);
  await redis.del(...keys);
}
