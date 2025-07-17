// src/db/migrate.ts
import { neon } from '@neondatabase/serverless';
import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { migrate } from 'drizzle-orm/neon-http/migrator';

config({ path: '.env.production' });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql });

export async function runMigrations() {
  console.log('Running database migrations...');

  try {
    await migrate(db, { migrationsFolder: './drizzle' });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration script failed:', error);
      process.exit(1);
    });
}
