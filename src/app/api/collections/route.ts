import collectionsData from '@/db/collections.json';
export async function GET(request: Request) {
  try {
    return new Response(JSON.stringify(collectionsData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
