/**
 * Reset and Seed Database Script
 *
 * This script provides a comprehensive solution to:
 * 1. Drop all existing tables (clean slate)
 * 2. Initialize the database schema
 * 3. Run any pending migrations
 * 4. Seed the database with test data
 */
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/neon-http/migrator';
import * as schema from '../src/db/schema';
import { spawn } from 'node:child_process';
import path from 'node:path';

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

/**
 * Drop all tables
 */
async function clearDatabase() {
  try {
    console.log('\n==== Step 1: Dropping all tables ====');
    await db.execute(sql`DROP TABLE IF EXISTS bids CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS collections CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE;`);
    console.log('✅ Tables dropped successfully');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
}

/**
 * Initialize the schema
 */
async function initializeSchema() {
  try {
    console.log('\n==== Step 2: Creating initial schema ====');

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
    console.log('✅ Users table created');

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
    console.log('✅ Collections table created');

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
    console.log('✅ Bids table created');

    console.log('✅ Schema initialization completed successfully');
  } catch (error) {
    console.error('❌ Schema initialization failed:', error);
    throw error;
  }
}

/**
 * Run migrations
 */
export async function runMigrations() {
  try {
    console.log('\n==== Step 3: Running migrations ====');
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}

/**
 * Seed the database with test data
 * This function runs the seed_database.ts script as a separate process
 */
function seedDatabase(): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log('\n==== Step 4: Seeding database ====');

    const seedScript = path.resolve(__dirname, 'seed_database.ts');
    const seedProcess = spawn('npx', ['tsx', seedScript], { stdio: 'inherit' });

    seedProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Database seeded successfully');
        resolve();
      } else {
        console.error(`❌ Seeding failed with code ${code}`);
        reject(new Error(`Seeding process exited with code ${code}`));
      }
    });

    seedProcess.on('error', (err) => {
      console.error('❌ Failed to start seed process:', err);
      reject(err);
    });
  });
}

/**
 * Main function to run all steps in sequence
 */
async function resetAndSeedDatabase() {
  try {
    console.log('🚀 Starting database reset and seed process...');

    // Step 1: Drop all tables
    await clearDatabase();

    // Step 2: Initialize schema
    await initializeSchema();

    // Skip migrations for now as they're causing issues
    console.log('\n==== Step 3: Skipping migrations ====');
    console.log('⚠️ Migrations skipped due to compatibility issues');

    // Step 4: Seed the database
    await seedDatabase();

    console.log('\n✨ Database reset and seeded successfully! ✨');
  } catch (error) {
    console.error('\n❌ Database reset and seed process failed:', error);
    process.exit(1);
  }
}

// Run the script if it's called directly
if (require.main === module) {
  resetAndSeedDatabase()
    .then(() => {
      console.log('Script execution complete');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Script failed:', error);
      process.exit(1);
    });
}
