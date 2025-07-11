import { initializeDatabase, migrateFromJSON } from '@/db';

let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) {
    return;
  }

  try {
    await initializeDatabase();
    await migrateFromJSON();
    isInitialized = true;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}
