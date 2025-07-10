import { getBidById } from '../utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const bidId = Number(params.id);
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
