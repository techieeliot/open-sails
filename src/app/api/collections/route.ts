import { NextRequest } from 'next/server';
import { createCollection, deleteCollection, getCollections, updateCollection } from './utils';

export async function GET() {
  try {
    const collections = await getCollections();
    return new Response(JSON.stringify(collections), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json(
      { error: `Failed to fetch collections: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newCollectionData = await request.json();
    const newCollection = await createCollection(newCollectionData);

    return new Response(JSON.stringify(newCollection), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json(
      { error: `Failed to create collection: ${(error as Error).message}` },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updatedData } = await request.json();
    if (!id) {
      return Response.json({ error: 'Collection ID is required' }, { status: 400 });
    }
    const updatedCollection = await updateCollection(id, updatedData);

    return new Response(JSON.stringify(updatedCollection), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return Response.json({ error: 'Collection ID is required' }, { status: 400 });
    }
    await deleteCollection(id);

    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}
