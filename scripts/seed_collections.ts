// Import modules with explicit extensions for ESM compatibility
import { db } from '../src/db/index.js';
import { schema } from '../src/db/schema.js';
import { config } from 'dotenv';

// Load environment variables
console.log('Loading environment variables from .env.production');
config({ path: '.env.production' });
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Found' : 'Not found');

type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
};

type NewCollection = {
  name: string;
  descriptions?: string;
  price: number;
  stocks: number;
  status: 'open' | 'closed';
  ownerId: number;
  createdAt: string;
  updatedAt: string;
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
  console.log('Starting collection seeding process...');

  try {
    // Get all users to assign as owners
    console.log('Fetching users from database...');
    const userList: User[] = await db.select().from(schema.users);

    if (userList.length === 0) {
      throw new Error('No users found in database. Please seed users first.');
    }

    console.log(`Found ${userList.length} users. Generating collections...`);

    const numToGenerate = 50;
    const newCollections: NewCollection[] = [];

    for (let i = 0; i < numToGenerate; i++) {
      const model = getRandomElement(hardwareModels);
      const condition = getRandomElement(conditions);
      const name = `${model.name} (${condition})`;
      const now = new Date();
      const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const updatedAt = createdAt;
      const owner = getRandomElement(userList);
      const status: 'open' | 'closed' = Math.random() > 0.2 ? 'open' : 'closed';

      newCollections.push({
        name,
        descriptions: generateDescription(model, condition),
        price: generatePrice(model.basePrice, condition),
        stocks: Math.floor(Math.random() * 50) + 1,
        status,
        ownerId: Number(owner.id),
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
      });
    }

    // Insert collections
    console.log(`Inserting ${numToGenerate} collections into the database...`);
    const collectionsToInsert = newCollections.map((col) => ({
      ...col,
      price: col.price.toString(),
    }));
    await db.insert(schema.collections).values(collectionsToInsert);
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
