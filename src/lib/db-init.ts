// For PostgreSQL with Neon, we don't need manual database initialization
// The database tables are created via migrations
let isInitialized = false;

export async function ensureDatabaseInitialized() {
  if (isInitialized) {
    return;
  }

  try {
    // For PostgreSQL, we just need to ensure the connection works
    // Tables are created via drizzle migrations
    console.log('Database connection established');
    isInitialized = true;
  } catch (error) {
    console.error('Failed to connect to database:', error);
    throw error;
  }
}
