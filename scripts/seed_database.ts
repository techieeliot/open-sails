/**
 * Comprehensive Database Seed Script
 *
 * This script populates the database with:
 * - 10 users (mix of admins and regular users)
 * - 100 collections (Bitcoin mining hardware with various conditions)
 * - At least 10 bids per collection (with realistic price variations)
 */

import * as dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';

// Load environment variables
console.log('Loading environment variables...');
dotenv.config({ path: '.env.production' });

// Check if DATABASE_URL is available
if (!process.env.DATABASE_URL) {
  console.error('Missing DATABASE_URL in environment variables');
  process.exit(1);
}

// Connect directly to database
const sql = neon(process.env.DATABASE_URL);

// Define types
type User = {
  id: string | number; // Can be UUID string or number
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at?: string;
  updated_at?: string;
};

type NewUser = {
  name: string;
  email: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
};

type Collection = {
  id: number;
  name: string;
  descriptions?: string;
  price: number;
  stocks: number;
  status: 'open' | 'closed';
  owner_id: string | number;
  created_at: string;
  updated_at: string;
};

type NewCollection = {
  name: string;
  descriptions?: string;
  price: number;
  stocks: number;
  status: 'open' | 'closed';
  owner_id: string | number;
  created_at: string;
  updated_at: string;
};

type NewBid = {
  price: number;
  collection_id: number;
  user_id: string | number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  created_at: string;
  updated_at: string;
};

// Sample Bitcoin mining hardware data
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

// Generate random user data
function generateUsers(count: number): NewUser[] {
  const users: NewUser[] = [];
  const domains = [
    'gmail.com',
    'yahoo.com',
    'outlook.com',
    'proton.me',
    'example.com',
    'company.co',
  ];
  const firstNames = [
    'Alice',
    'Bob',
    'Charlie',
    'Diana',
    'Ethan',
    'Fiona',
    'George',
    'Hannah',
    'Ian',
    'Julia',
    'Kevin',
    'Linda',
  ];
  const lastNames = [
    'Smith',
    'Johnson',
    'Williams',
    'Brown',
    'Jones',
    'Miller',
    'Davis',
    'Garcia',
    'Rodriguez',
    'Wilson',
    'Martinez',
  ];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    const now = new Date();
    const created = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Within the last 60 days

    users.push({
      name: `${firstName} ${lastName}`,
      email,
      role: i < 2 ? 'admin' : 'user', // First two users are admins
      created_at: created.toISOString(),
      updated_at: created.toISOString(),
    });
  }

  return users;
}

// Generate bids for a collection
function generateBidsForCollection(
  collectionId: number,
  userIds: (string | number)[],
  count: number,
  collectionStatus: 'open' | 'closed',
): NewBid[] {
  const bids: NewBid[] = [];
  const basePrice = Math.floor(Math.random() * 3000) + 1000; // Random base price between 1000 and 4000

  // Determine if this collection will have an accepted bid
  // If collection is closed, there should be an accepted bid
  // If collection is open, all bids should be pending
  const hasAcceptedBid = collectionStatus === 'closed';

  // If we have an accepted bid, randomly choose which bid number will be accepted
  // This simulates the scenario where a random bid was accepted
  const acceptedBidIndex = hasAcceptedBid ? Math.floor(Math.random() * count) : -1;

  for (let i = 0; i < count; i++) {
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const now = new Date();
    const created = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Within the last 30 days
    const price = Math.round(basePrice * (0.9 + Math.random() * 0.4)); // Price varies between 90% and 130% of base price

    // Determine bid status based on our business rules:
    // - If collection is open, all bids should be pending
    // - If collection is closed:
    //   - One bid is accepted (the randomly selected one)
    //   - All other bids are rejected
    let status: 'pending' | 'accepted' | 'rejected' | 'cancelled';

    if (collectionStatus === 'open') {
      status = 'pending';
    } else {
      // Collection is closed
      if (i === acceptedBidIndex) {
        status = 'accepted';
      } else {
        status = 'rejected';
      }
    }

    bids.push({
      price,
      collection_id: collectionId,
      user_id: userId,
      status,
      created_at: created.toISOString(),
      updated_at: created.toISOString(),
    });
  }

  return bids;
}

async function main() {
  try {
    console.log('Starting comprehensive database seeding process...');

    // Step 1: Clear existing tables if needed (in reverse order of dependencies)
    console.log('Clearing existing data...');
    await sql`TRUNCATE TABLE bids CASCADE`;
    await sql`TRUNCATE TABLE collections CASCADE`;
    await sql`TRUNCATE TABLE users CASCADE`;

    // Step 2: Create 10 users
    console.log('Generating 10 users...');
    const newUsers = generateUsers(10);
    const userIds: (string | number)[] = [];

    for (const user of newUsers) {
      const result = await sql`
        INSERT INTO users (name, email, role, created_at, updated_at)
        VALUES (${user.name}, ${user.email}, ${user.role}, ${user.created_at}, ${user.updated_at})
        RETURNING id
      `;

      if (result && result[0] && result[0].id) {
        userIds.push(result[0].id);
      }
    }

    console.log(`Successfully created ${userIds.length} users`);

    // Step 3: Create collections
    const numCollections = 100;
    console.log(`Generating ${numCollections} collections...`);

    const newCollections: NewCollection[] = [];
    const collectionIds: number[] = [];

    for (let i = 0; i < numCollections; i++) {
      const model = getRandomElement(hardwareModels);
      const condition = getRandomElement(conditions);
      const name = `${model.name} (${condition})`;
      const now = new Date();
      const created_at = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
      const updated_at = created_at;
      const ownerId = userIds[Math.floor(Math.random() * userIds.length)];
      // We want about 20% of collections to be closed with an accepted bid
      const status: 'open' | 'closed' = Math.random() > 0.8 ? 'closed' : 'open';

      newCollections.push({
        name,
        descriptions: generateDescription(model, condition),
        price: generatePrice(model.basePrice, condition),
        stocks: Math.floor(Math.random() * 50) + 1,
        status,
        owner_id: ownerId,
        created_at: created_at.toISOString(),
        updated_at: updated_at.toISOString(),
      });
    }

    // Insert collections using raw SQL
    console.log(`Inserting ${numCollections} collections into the database...`);

    // Insert collections one by one and record their IDs
    for (const collection of newCollections) {
      // Debug output to help identify the issue
      console.log('Inserting collection:', {
        name: collection.name,
        owner_id: collection.owner_id,
        price: collection.price,
        stocks: collection.stocks,
        status: collection.status,
      });

      const result = await sql`
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
        RETURNING id
      `;

      if (result && result[0] && result[0].id) {
        collectionIds.push(result[0].id);
      }
    }

    console.log(`Successfully seeded ${collectionIds.length} collections to the database.`);

    // Step 4: Create bids for each collection
    console.log('Generating bids for collections...');
    let totalBids = 0;

    // First, retrieve collection statuses
    const collectionStatusMap = new Map<number, 'open' | 'closed'>();

    for (let i = 0; i < collectionIds.length; i++) {
      // Use the status from the collection we created earlier
      collectionStatusMap.set(collectionIds[i], newCollections[i].status);
    }

    for (const collectionId of collectionIds) {
      const collectionStatus = collectionStatusMap.get(collectionId) || 'open';
      const numBids = Math.floor(Math.random() * 5) + 10; // 10-14 bids per collection
      const bids = generateBidsForCollection(collectionId, userIds, numBids, collectionStatus);

      for (const bid of bids) {
        await sql`
          INSERT INTO bids (price, collection_id, user_id, status, created_at, updated_at)
          VALUES (
            ${bid.price},
            ${bid.collection_id},
            ${bid.user_id},
            ${bid.status},
            ${bid.created_at},
            ${bid.updated_at}
          )
        `;
        totalBids++;
      }
    }

    console.log(
      `Successfully seeded ${totalBids} bids across ${collectionIds.length} collections.`,
    );
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
}

// Run the main function
main().catch((err) => {
  console.error('Unhandled error during seed operation:', err);
  process.exit(1);
});
