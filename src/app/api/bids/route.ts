import { NextRequest } from 'next/server';
import { createBid, deleteBid, getBidsByCollectionId, updateBid, updateBidStatus } from './utils';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const collectionId = searchParams.get('collection_id');

  try {
    if (collectionId) {
      const bids = await getBidsByCollectionId(Number(collectionId));
      return new Response(JSON.stringify(bids), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return Response.json({ error: 'Collection ID is required' }, { status: 400 });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch bids' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const newBidData = await request.json();
    if (!newBidData.collectionId || !newBidData.userId || !newBidData.price) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newBid = await createBid(newBidData);
    return new Response(JSON.stringify(newBid), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to create bid' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const { searchParams } = new URL(request.url);
  const bidId = searchParams.get('bid_id');
  const collectionId = searchParams.get('collection_id');

  if (!bidId || !collectionId) {
    return Response.json({ error: 'Bid and Collection ID are required' }, { status: 400 });
  }

  const bidIdNumeric = Number(bidId);
  const collectionIdNumeric = Number(collectionId);

  if (isNaN(bidIdNumeric) || isNaN(collectionIdNumeric)) {
    return Response.json({ error: 'Invalid Bid or Collection ID' }, { status: 400 });
  }

  try {
    const { status } = await request.json();
    if (status) {
      await updateBidStatus(bidIdNumeric, status, collectionIdNumeric);
    } else {
      const updatedData = await request.json();
      await updateBid(bidIdNumeric, updatedData);
    }
    const updatedBids = await getBidsByCollectionId(collectionIdNumeric);
    return new Response(JSON.stringify(updatedBids), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const bidId = searchParams.get('bid_id');

  if (!bidId) {
    return Response.json({ error: 'Bid ID is required' }, { status: 400 });
  }

  try {
    await deleteBid(Number(bidId));
    return new Response(null, { status: 204 });
  } catch (error: any) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
