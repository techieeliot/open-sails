import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { users, collections, bids } from './schema';
import * as schema from './schema';

// Initialize PostgreSQL database with Neon
const sql = neon(process.env.DATABASE_URL!);

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Seed database with default users
export async function seedDatabase() {
  try {
    console.log('Seeding database with default users...');

    // Create default users
    const defaultUsers = [
      {
        id: 1,
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'admin' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        role: 'user' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Insert default users
    for (const user of defaultUsers) {
      try {
        await db.insert(users).values(user).onConflictDoNothing();
        console.log(`Inserted user: ${user.name}`);
      } catch (error) {
        // User might already exist, that's okay
        console.log(`User ${user.name} already exists or error inserting:`, error);
      }
    }

    // Create default collections
    const defaultCollections = [
      {
        id: 1,
        name: 'Antique Coins',
        descriptions: 'A collection of rare coins from around the world.',
        price: 100,
        stocks: 10,
        ownerId: 1, // Alice
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: 'Vintage Stamps',
        descriptions: 'A collection of vintage stamps from the 20th century.',
        price: 50,
        stocks: 25,
        ownerId: 2, // Bob
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Insert default collections
    for (const collection of defaultCollections) {
      try {
        await db.insert(collections).values(collection).onConflictDoNothing();
        console.log(`Inserted collection: ${collection.name}`);
      } catch (error) {
        console.log(`Collection ${collection.name} already exists or error inserting:`, error);
      }
    }

    // Create default bids
    const defaultBids = [
      {
        id: 1,
        price: 110,
        collectionId: 1, // Antique Coins
        userId: 2, // Bob
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        price: 120,
        collectionId: 1, // Antique Coins
        userId: 3, // Charlie
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        price: 60,
        collectionId: 2, // Vintage Stamps
        userId: 1, // Alice
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    // Insert default bids
    for (const bid of defaultBids) {
      try {
        await db.insert(bids).values(bid).onConflictDoNothing();
        console.log(`Inserted bid: ${bid.id}`);
      } catch (error) {
        console.log(`Bid ${bid.id} already exists or error inserting:`, error);
      }
    }

    console.log('Database seeding completed successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Export the database instance and schema
export { users, collections, bids };
export * from './schema';
