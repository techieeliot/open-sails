const fs = require('node:fs');
const path = require('node:path');

const collectionsFilePath = path.join(__dirname, '../src/db/collections.json');

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// Data for generating new hardware collections
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

const hardwareModels = [
  {
    name: 'Antminer S21 Pro',
    basePrice: 4000,
    hashrate: '234 TH/s',
    power: '3510W',
    efficiency: '15 J/TH',
  },
  {
    name: 'Whatsminer M60',
    basePrice: 3800,
    hashrate: '186 TH/s',
    power: '3441W',
    efficiency: '18.5 J/TH',
  },
  {
    name: 'Canaan Avalon A1466',
    basePrice: 3200,
    hashrate: '150 TH/s',
    power: '3230W',
    efficiency: '21.5 J/TH',
  },
  {
    name: 'Antminer L9',
    basePrice: 6000,
    hashrate: '12 GH/s',
    power: '3360W',
    efficiency: '0.28 J/MH',
  },
  {
    name: 'Jasminer X44-Q',
    basePrice: 2500,
    hashrate: '2500 MH/s',
    power: '840W',
    efficiency: '0.34 J/MH',
  },
  {
    name: 'iBeLink BM-K5',
    basePrice: 10000,
    hashrate: '120 TH/s',
    power: '3300W',
    efficiency: '27.5 J/TH',
  },
  {
    name: 'Goldshell KA-BOX',
    basePrice: 1500,
    hashrate: '1.18 TH/s',
    power: '400W',
    efficiency: '338 J/TH',
  },
  {
    name: 'Antminer E11',
    basePrice: 4200,
    hashrate: '4200 MH/s',
    power: '2400W',
    efficiency: '0.57 J/MH',
  },
  {
    name: 'Whatsminer M66S',
    basePrice: 5500,
    hashrate: '298 TH/s',
    power: '5570W',
    efficiency: '18.7 J/TH',
  },
  {
    name: 'Goldshell CK-STAR',
    basePrice: 7000,
    hashrate: '25 TH/s',
    power: '3100W',
    efficiency: '124 J/TH',
  },
];

const conditions = ['New', 'Refurbished', 'Used', 'Bulk - 5 Units', 'Bulk - 10 Units'];

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// Helper functions
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateDescription(model, condition) {
  let desc = `A ${condition.toLowerCase()} ${model.name}. Delivers a hashrate of ${model.hashrate} with an efficiency of ${model.efficiency}. Power consumption is approximately ${model.power}.`;
  if (condition.includes('Bulk')) {
    const units = condition.split(' ')[2];
    desc = `${units} units of the ${model.name}. ${desc}`;
  }
  if (condition === 'Refurbished') {
    desc += ' Comes with a 6-month warranty.';
  }
  if (condition === 'Used') {
    desc += ' Tested and fully functional. Sold as-is.';
  }
  return desc;
}

function generatePrice(basePrice, condition) {
  let price = basePrice * (1 + (Math.random() - 0.1) * 0.2); // Fluctuate price by +/- 10%
  if (condition === 'Refurbished') price *= 0.8;
  if (condition === 'Used') price *= 0.65;
  if (condition.includes('Bulk')) {
    const units = parseInt(condition.split(' ')[2]);
    price *= units * 0.95; // Apply a 5% discount for bulk
  }
  return parseFloat(price.toFixed(2));
}

// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---
// Main script logic
// --- --- --- --- --- --- --- --- --- --- --- --- --- --- --- ---

try {
  // Read existing collections
  const collectionsData = fs.readFileSync(collectionsFilePath, 'utf-8');
  const collections = JSON.parse(collectionsData);
  let lastId = collections.length > 0 ? Math.max(...collections.map((c) => c.id)) : 0;

  const newCollections = [];
  const numToGenerate = 50; // Generate 50 new collections

  for (let i = 0; i < numToGenerate; i++) {
    lastId++;
    const model = getRandomElement(hardwareModels);
    const condition = getRandomElement(conditions);
    const name = `${model.name} (${condition})`;

    const now = new Date();
    const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // Within the last 30 days
    const updatedAt = createdAt;

    const newCollection = {
      id: lastId,
      name: name,
      descriptions: generateDescription(model, condition),
      price: generatePrice(model.basePrice, condition),
      stocks: Math.floor(Math.random() * 50) + 1,
      status: Math.random() > 0.2 ? 'open' : 'closed', // 80% chance of being open
      createdAt: createdAt.toISOString(),
      updatedAt: updatedAt.toISOString(),
    };
    newCollections.push(newCollection);
  }

  // Combine and write back to the file
  const allCollections = [...collections, ...newCollections];
  fs.writeFileSync(collectionsFilePath, JSON.stringify(allCollections, null, 2));

  console.log(`Successfully generated and added ${numToGenerate} new collections.`);
  console.log(`Total collections now: ${allCollections.length}`);
} catch (error) {
  console.error('Error generating collections:', error);
}
