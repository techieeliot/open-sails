import { getCollectionById } from '../utils';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const collectionId = Number(params.id);
    if (isNaN(collectionId)) {
      return Response.json({ error: 'Invalid collection ID' }, { status: 400 });
    }

    const collection = await getCollectionById(collectionId);
    if (!collection) {
      return Response.json({ error: 'Collection not found' }, { status: 404 });
    }
    return new Response(JSON.stringify(collection), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch collection' }, { status: 500 });
  }
}
