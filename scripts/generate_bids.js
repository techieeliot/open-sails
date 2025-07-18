const fs = require('node:fs');
const path = require('node:path');

const usersFilePath = path.join(__dirname, 'src/db/users.json');
const collectionsFilePath = path.join(__dirname, 'src/db/collections.json');
const bidsFilePath = path.join(__dirname, 'src/db/bids.json');

const users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
const collections = JSON.parse(fs.readFileSync(collectionsFilePath, 'utf-8'));

const bids = [];
let bidId = 1;

collections.forEach((collection) => {
  const numBids = Math.floor(Math.random() * 6) + 10; // 10 to 15 bids per collection
  for (let i = 0; i < numBids; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const price = collection.price;
    const amount = price * (0.9 + Math.random() * 0.2); // +/- 10% of the price

    const now = new Date();
    const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000); // within the last 30 days

    bids.push({
      id: bidId++,
      collectionId: collection.id,
      userId: user.id,
      price: parseFloat(amount.toFixed(2)),
      status: 'pending',
      createdAt: createdAt.toISOString(),
      updatedAt: createdAt.toISOString(),
    });
  }
});

fs.writeFileSync(bidsFilePath, JSON.stringify(bids, null, 2));

console.log(`Generated ${bids.length} bids and saved to ${bidsFilePath}`);
