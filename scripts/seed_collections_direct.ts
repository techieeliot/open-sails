// Direct import approach for better ESM compatibility
import * as dotenv from 'dotenv';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';

// Log script startup
console.log('Starting collection seeding process...');

// Load environment variables
dotenv.config({ path: '.env.production' });

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in environment variables');
  process.exit(1);
}

// Define schema structure inline to avoid import issues
const pgTableSymbol = Symbol('pgTable');

// Connect directly to database
const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

// Define types
type User = {
  id: string; // UUID string
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
};

type NewCollection = {
  name: string;
  descriptions?: string;
  price: number;
  stocks: number;
  status: 'open' | 'closed';
  owner_id: string; // UUID string
  created_at: string;
  updated_at: string;
};

const hardwareModels = [
  { name: 'Antminer S21 Pro', basePrice: 4000 },
  { name: 'Whatsminer M60', basePrice: 3800 },
  { name: 'Canaan Avalon A1466', basePrice: 3200 },
  { name: 'Antminer L9', basePrice: 6000 },
  { name: 'Jasminer X44-Q', basePrice: 2500 },
  { name: 'iBeLink BM-K5', basePrice: 10000 },
  { name: 'Goldshell KA-BOX', basePrice: 1500 },
  { name: 'Antminer E11', basePrice: 4200 },
  { name: 'Whatsminer M66S', basePrice: 5500 },
  { name: 'Goldshell CK-STAR', basePrice: 7000 },
];
const conditions = ['New', 'Refurbished', 'Used', 'Bulk - 5 Units', 'Bulk - 10 Units'];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDescription(model: { name: string }, condition: string): string {
  let desc = `A ${condition.toLowerCase()} ${model.name}.`;
  if (condition.includes('Bulk')) {
    const units = condition.split(' ')[2];
    desc = `${units} units of the ${model.name}. ${desc}`;
  }
  if (condition === 'Refurbished') desc += ' Comes with a 6-month warranty.';
  if (condition === 'Used') desc += ' Tested and fully functional. Sold as-is.';
  return desc;
}

function generatePrice(basePrice: number, condition: string): number {
  let price = basePrice * (1 + (Math.random() - 0.1) * 0.2);
  if (condition === 'Refurbished') price *= 0.8;
  if (condition === 'Used') price *= 0.65;
  if (condition.includes('Bulk')) {
    const units = parseInt(condition.split(' ')[2]);
    price *= units * 0.95;
  }
  return Math.round(price);
}

async function main() {
  try {
    console.log('Fetching users from database...');

    // Using raw SQL query to fetch users since we don't have schema types
    const userList = await sql`SELECT * FROM users`;
    console.log(`Found ${userList.length} users`);

    if (userList.length === 0) {
      throw new Error('No users found in database. Please seed users first.');
    }

    const numToGenerate = 50;
    const newCollections: NewCollection[] = [];

    console.log(`Generating ${numToGenerate} collections...`);

    for (let i = 0; i < numToGenerate; i++) {
      const model = getRandomElement(hardwareModels);
      const condition = getRandomElement(conditions);
      const name = `${model.name} (${condition})`;
      const now = new Date();
      const created_at = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const updated_at = created_at;
      const owner = getRandomElement(userList);
      const status: 'open' | 'closed' = Math.random() > 0.2 ? 'open' : 'closed';

      newCollections.push({
        name,
        descriptions: generateDescription(model, condition),
        price: generatePrice(model.basePrice, condition),
        stocks: Math.floor(Math.random() * 50) + 1,
        status,
        owner_id: owner.id, // Use the UUID string directly
        created_at: created_at.toISOString(),
        updated_at: updated_at.toISOString(),
      });
    }

    // Insert collections using raw SQL
    console.log(`Inserting ${numToGenerate} collections into the database...`);

    // Insert collections one by one
    for (const collection of newCollections) {
      // Debug output to help identify the issue
      console.log('Inserting collection:', {
        name: collection.name,
        owner_id: collection.owner_id,
        price: collection.price,
        stocks: collection.stocks,
        status: collection.status,
      });

      // Make sure owner_id is a valid UUID
      if (!collection.owner_id || collection.owner_id === 'undefined') {
        console.warn(`Invalid owner_id: ${collection.owner_id}, using first user ID`);
        // Set to the first user's ID from our query
        collection.owner_id = userList[0].id;
      }

      await sql`
        INSERT INTO collections (name, descriptions, price, stocks, status, owner_id, created_at, updated_at)
        VALUES (
          ${collection.name}, 
          ${collection.descriptions}, 
          ${collection.price}, 
          ${collection.stocks}, 
          ${collection.status}, 
          ${collection.owner_id}, 
          ${collection.created_at}, 
          ${collection.updated_at}
        )
      `;
    }

    console.log(`Successfully seeded ${numToGenerate} collections to the database.`);
  } catch (err) {
    console.error('Error seeding collections:', err);
    process.exit(1);
  }
}

// Run the main function
main().catch((err) => {
  console.error('Unhandled error during seed operation:', err);
  process.exit(1);
});
