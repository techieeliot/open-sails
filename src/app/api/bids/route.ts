import bidsData from '@/db/bids.json';
import { writeFile } from 'fs/promises';

export async function GET(request: Request) {
  try {
    return new Response(JSON.stringify(bidsData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch bids' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newBid = await request.json();
    const bidsPath = 'src/db/bids.json';

    if (!newBid.collection_id || !newBid.user_id || !newBid.price) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newId = Math.max(...bidsData.map((b) => Number(b.id))) + 1;
    const bidToAdd = {
      id: newId,
      ...newBid,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedBids = [...bidsData, bidToAdd];
    await writeFile(bidsPath, JSON.stringify(updatedBids, null, 2));

    return new Response(JSON.stringify(bidToAdd), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to create bid' }, { status: 500 });
  }
}
