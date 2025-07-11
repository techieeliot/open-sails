import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users, collections, bids } from './schema';
import * as schema from './schema';

// Initialize SQLite database
const sqlite = new Database(':memory:'); // For production, use file path like './database.sqlite'

// Create Drizzle instance
export const db = drizzle(sqlite, { schema });

// Initialize database tables
export async function initializeDatabase() {
  // Disable foreign key constraints during setup
  sqlite.exec('PRAGMA foreign_keys = OFF');

  // Create tables
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS collections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      descriptions TEXT,
      price INTEGER NOT NULL,
      stocks INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
      owner_id INTEGER NOT NULL REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS bids (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      price INTEGER NOT NULL,
      collection_id INTEGER NOT NULL REFERENCES collections(id),
      user_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  // Create indexes for better performance
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_collections_owner ON collections(owner_id)`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_bids_collection ON bids(collection_id)`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_bids_user ON bids(user_id)`);
  sqlite.exec(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);

  // Re-enable foreign key constraints after setup
  sqlite.exec('PRAGMA foreign_keys = ON');
}

// Migration function to seed data from JSON files
export async function migrateFromJSON() {
  try {
    // Disable foreign key constraints during migration
    sqlite.exec('PRAGMA foreign_keys = OFF');

    // Import existing JSON data
    const fs = await import('fs');
    const path = await import('path');

    const usersPath = path.join(process.cwd(), 'src/db/users.json');
    const collectionsPath = path.join(process.cwd(), 'src/db/collections.json');
    const bidsPath = path.join(process.cwd(), 'src/db/bids.json');

    // Check if files exist before trying to read them
    if (!fs.existsSync(usersPath) || !fs.existsSync(collectionsPath) || !fs.existsSync(bidsPath)) {
      console.log('JSON files not found, skipping migration');
      return;
    }

    const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf-8'));
    const collectionsData = JSON.parse(fs.readFileSync(collectionsPath, 'utf-8'));
    const bidsData = JSON.parse(fs.readFileSync(bidsPath, 'utf-8'));

    // Ensure we have a default user (id=1) for collections without valid owners
    const defaultUser = {
      id: 1,
      name: 'Default User',
      email: 'default@example.com',
      role: 'admin' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Insert default user first if it doesn't exist
    await db
      .insert(users)
      .values(defaultUser)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: defaultUser.name,
          email: defaultUser.email,
          role: defaultUser.role,
          updatedAt: defaultUser.updatedAt,
        },
      });

    // Insert users first
    for (const user of usersData) {
      await db
        .insert(users)
        .values({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role as 'admin' | 'user',
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
        .onConflictDoUpdate({
          target: users.id,
          set: {
            name: user.name,
            email: user.email,
            role: user.role as 'admin' | 'user',
            updatedAt: user.updatedAt,
          },
        });
    }

    // Insert collections with proper owner_id mapping
    for (const collection of collectionsData) {
      // Ensure we have a valid ownerId, default to user 1 if missing
      const ownerId =
        collection.ownerId && typeof collection.ownerId === 'number' ? collection.ownerId : 1;

      await db
        .insert(collections)
        .values({
          id: collection.id,
          name: collection.name,
          descriptions: collection.descriptions,
          price: collection.price,
          stocks: collection.stocks,
          status: collection.status,
          ownerId: ownerId,
          createdAt: collection.createdAt,
          updatedAt: collection.updatedAt,
        })
        .onConflictDoUpdate({
          target: collections.id,
          set: {
            name: collection.name,
            descriptions: collection.descriptions,
            price: collection.price,
            stocks: collection.stocks,
            status: collection.status,
            ownerId: ownerId,
            updatedAt: collection.updatedAt,
          },
        });
    }

    // Insert bids
    for (const bid of bidsData) {
      await db
        .insert(bids)
        .values({
          id: bid.id,
          price: bid.price,
          collectionId: bid.collectionId,
          userId: bid.userId,
          status: bid.status,
          createdAt: bid.createdAt,
          updatedAt: bid.updatedAt,
        })
        .onConflictDoUpdate({
          target: bids.id,
          set: {
            price: bid.price,
            collectionId: bid.collectionId,
            userId: bid.userId,
            status: bid.status,
            updatedAt: bid.updatedAt,
          },
        });
    }

    // Re-enable foreign key constraints
    sqlite.exec('PRAGMA foreign_keys = ON');

    console.log('Database migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  }
}

// Export the database instance and schema
export { users, collections, bids };
export * from './schema';
