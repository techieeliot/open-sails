import { eq, and } from 'drizzle-orm';
import { db, users, collections, bids } from '../db';
import type { User, NewUser, Collection, NewCollection, Bid, NewBid } from '../db/schema';

// User service
export class UserService {
  static async findAll(): Promise<User[]> {
    return await db.select().from(users);
  }

  static async findById(id: number): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  static async findByEmail(email: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result[0] || null;
  }

  static async create(userData: NewUser): Promise<User> {
    const result = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();
    return result[0];
  }

  static async update(id: number, userData: Partial<NewUser>): Promise<User> {
    const result = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(users.id, id))
      .returning();
    return result[0];
  }

  static async delete(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }
}

// Collection service
export class CollectionService {
  static async findAll(): Promise<Collection[]> {
    return await db.select().from(collections);
  }

  static async findById(id: number): Promise<Collection | null> {
    const result = await db.select().from(collections).where(eq(collections.id, id));
    return result[0] || null;
  }

  static async findByOwnerId(ownerId: number): Promise<Collection[]> {
    return await db.select().from(collections).where(eq(collections.ownerId, ownerId));
  }

  static async create(collectionData: NewCollection): Promise<Collection> {
    const result = await db
      .insert(collections)
      .values({
        ...collectionData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();
    return result[0];
  }

  static async update(id: number, collectionData: Partial<NewCollection>): Promise<Collection> {
    const result = await db
      .update(collections)
      .set({
        ...collectionData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(collections.id, id))
      .returning();
    return result[0];
  }

  static async delete(id: number): Promise<void> {
    await db.delete(collections).where(eq(collections.id, id));
  }

  // Get collections with owner information
  static async findAllWithOwner() {
    return await db
      .select({
        id: collections.id,
        name: collections.name,
        descriptions: collections.descriptions,
        price: collections.price,
        stocks: collections.stocks,
        status: collections.status,
        createdAt: collections.createdAt,
        updatedAt: collections.updatedAt,
        owner: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
      })
      .from(collections)
      .leftJoin(users, eq(collections.ownerId, users.id));
  }
}

// Bid service
export class BidService {
  static async findAll(): Promise<Bid[]> {
    return await db.select().from(bids);
  }

  static async findById(id: number): Promise<Bid | null> {
    const result = await db.select().from(bids).where(eq(bids.id, id));
    return result[0] || null;
  }

  static async findByCollectionId(collectionId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.collectionId, collectionId));
  }

  static async findByUserId(userId: number): Promise<Bid[]> {
    return await db.select().from(bids).where(eq(bids.userId, userId));
  }

  static async create(bidData: NewBid): Promise<Bid> {
    const result = await db
      .insert(bids)
      .values({
        ...bidData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .returning();
    return result[0];
  }

  static async update(id: number, bidData: Partial<NewBid>): Promise<Bid> {
    const result = await db
      .update(bids)
      .set({
        ...bidData,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bids.id, id))
      .returning();
    return result[0];
  }

  static async updateStatus(id: number, status: Bid['status']): Promise<Bid> {
    const result = await db
      .update(bids)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(bids.id, id))
      .returning();
    return result[0];
  }

  static async delete(id: number): Promise<void> {
    await db.delete(bids).where(eq(bids.id, id));
  }

  // Accept a bid and reject all others for the same collection
  static async acceptBid(bidId: number, collectionId: number): Promise<void> {
    await db.transaction(async (tx) => {
      // Accept the selected bid
      await tx
        .update(bids)
        .set({
          status: 'accepted',
          updatedAt: new Date().toISOString(),
        })
        .where(eq(bids.id, bidId));

      // Reject all other bids for this collection
      await tx
        .update(bids)
        .set({
          status: 'rejected',
          updatedAt: new Date().toISOString(),
        })
        .where(and(eq(bids.collectionId, collectionId), eq(bids.status, 'pending')));
    });
  }

  // Get bids with user and collection information
  static async findByCollectionIdWithDetails(collectionId: number) {
    return await db
      .select({
        id: bids.id,
        price: bids.price,
        status: bids.status,
        createdAt: bids.createdAt,
        updatedAt: bids.updatedAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email,
        },
        collection: {
          id: collections.id,
          name: collections.name,
        },
      })
      .from(bids)
      .leftJoin(users, eq(bids.userId, users.id))
      .leftJoin(collections, eq(bids.collectionId, collections.id))
      .where(eq(bids.collectionId, collectionId));
  }
}
