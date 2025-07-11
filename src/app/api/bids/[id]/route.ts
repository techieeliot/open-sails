import { NextRequest } from 'next/server';
import { getBidById } from '../utils';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  try {
    const bidId = Number(searchParams.get('id'));
    if (isNaN(bidId)) {
      return Response.json({ error: 'Invalid bid ID' }, { status: 400 });
    }
    const bid = await getBidById(bidId);
    if (!bid) {
      return Response.json({ error: 'Bid not found' }, { status: 404 });
    }
    return new Response(JSON.stringify(bid), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
