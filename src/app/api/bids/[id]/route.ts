import bidsData from '@/db/bids.json';
import { writeFile } from 'fs/promises';

export async function GET(request: Request) {
  const bidId = request.url.split('/').pop();
  try {
    if (!bidId || isNaN(Number(bidId))) {
      return Response.json({ error: 'Invalid bid ID' }, { status: 400 });
    }
    const bid = bidsData.find((b) => b.id === Number(bidId));
    if (!bid) {
      return Response.json({ error: 'Bid not found' }, { status: 404 });
    }
    return new Response(JSON.stringify(bid), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch bids' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const bidId = request.url.split('/').pop();
  const bidsPath = 'src/db/bids.json';

  try {
    const { status } = await request.json();
    if (!bidId || isNaN(Number(bidId))) {
      return Response.json({ error: 'Invalid bid ID' }, { status: 400 });
    }
    if (!status || !['accepted', 'rejected', 'pending'].includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }
    const bidIndex = bidsData.findIndex((b) => b.id === Number(bidId));

    if (bidIndex === -1) {
      return Response.json({ error: 'Bid not found' }, { status: 404 });
    }

    const updatedBid = {
      ...bidsData[bidIndex],
      status,
      updatedAt: new Date().toISOString(),
    };

    const updatedBids = [...bidsData];
    updatedBids[bidIndex] = updatedBid;

    // If a bid is accepted, reject all other bids for the same collection
    if (status === 'accepted') {
      const collectionId = updatedBid.collectionId;
      for (let i = 0; i < updatedBids.length; i++) {
        if (
          updatedBids[i].collectionId === collectionId &&
          bidId &&
          updatedBids[i].id !== Number(bidId)
        ) {
          updatedBids[i].status = 'rejected';
          updatedBids[i].updatedAt = new Date().toISOString();
        }
      }
    }

    await writeFile(bidsPath, JSON.stringify(updatedBids, null, 2));

    return new Response(JSON.stringify(updatedBid), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to update bid' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const bidsPath = 'src/db/bids.json';
  const bidId = request.url.split('/').pop() || 'defaultBid';

  try {
    const updatedBids = bidsData.filter((b) => b.id !== Number(bidId));

    if (updatedBids.length === bidsData.length) {
      return Response.json({ error: 'Bid not found' }, { status: 404 });
    }

    await writeFile(bidsPath, JSON.stringify(updatedBids, null, 2));

    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json({ error: 'Failed to delete bid' }, { status: 500 });
  }
}
