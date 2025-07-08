import bidsData from '@/db/bids.json';

export async function GET(request: Request) {
  try {
    return new Response(JSON.stringify(bidsData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch bids' }, { status: 500 });
  }
}
