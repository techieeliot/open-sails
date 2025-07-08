import collectionsData from '@/db/collections.json';

export async function GET(request: Request) {
  const collectionId = request.url.split('/').pop() || 0;
  try {
    if (!collectionId) {
      return Response.json({ error: 'Collection ID is required' }, { status: 400 });
    }
    if (collectionId === 'route' || isNaN(Number(collectionId))) {
      return Response.json({ error: 'Invalid collection ID' }, { status: 400 });
    }

    const collection = collectionsData.find((c) => c.id === Number(collectionId));
    if (!collection) {
      return Response.json({ error: 'Collection not found' }, { status: 404 });
    }
    return new Response(JSON.stringify(collection), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}
