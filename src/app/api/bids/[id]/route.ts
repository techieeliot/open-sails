import bidsData from '@/db/bids.json';

export async function GET(request: Request) {
  const bidId = request.url.split('/').pop() || 'defaultBid';
  try {
    const bid = bidsData.find((b) => b.id === bidId);
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
