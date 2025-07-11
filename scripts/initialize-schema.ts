/**
 * Initialize Database Schema Script
 *
 * This script creates the initial schema structure for the database.
 * It should be run before migrations or seeding if the tables don't exist.
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import * as schema from '../src/db/schema';
import { sql } from 'drizzle-orm';

// Load environment variables
console.log('Loading environment variables...');
config({ path: '.env.production' });

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in environment variables');
  process.exit(1);
}

// Connect to database
const client = neon(process.env.DATABASE_URL);
const db = drizzle({ client, schema });

async function initializeSchema() {
  try {
    console.log("Creating tables if they don't exist...");

    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('- Users table created');

    // Create collections table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS collections (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        descriptions TEXT,
        price INTEGER NOT NULL,
        stocks INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'open',
        owner_id INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('- Collections table created');

    // Create bids table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS bids (
        id SERIAL PRIMARY KEY,
        price INTEGER NOT NULL,
        collection_id INTEGER NOT NULL REFERENCES collections(id),
        user_id INTEGER NOT NULL REFERENCES users(id),
        status TEXT NOT NULL DEFAULT 'pending',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('- Bids table created');

    console.log('Schema initialization completed successfully');
  } catch (error) {
    console.error('Schema initialization failed:', error);
    throw error;
  }
}

if (require.main === module) {
  initializeSchema()
    .then(() => {
      console.log('Schema initialization script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Schema initialization script failed:', error);
      process.exit(1);
    });
}
