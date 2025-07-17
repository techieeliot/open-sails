// src/db.ts
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

config({ path: '.env.production' }); // or .env.local

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });

// Export schema for use in API routes
export { schema };
export const { users, collections, bids } = schema;

// Seed function for initial data
export async function seedDatabase() {
  try {
    // Check if users already exist
    const existingUsers = await db.select().from(users).limit(1);
    if (existingUsers.length > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database with initial data...');

    // Create default users
    const defaultUsers = [
      {
        name: 'Alice Johnson',
        email: 'alice@example.com',
        role: 'user' as const,
      },
      {
        name: 'Bob Smith',
        email: 'bob@example.com',
        role: 'admin' as const,
      },
      {
        name: 'Charlie Brown',
        email: 'charlie@example.com',
        role: 'user' as const,
      },
    ];

    // Insert users
    for (const user of defaultUsers) {
      await db.insert(users).values(user);
    }

    console.log(`Seeded ${defaultUsers.length} users successfully`);
  } catch (error) {
    console.error('Failed to seed database:', error);
    throw error;
  }
}
