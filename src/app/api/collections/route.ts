import collectionsData from '@/db/collections.json';
import { writeFile } from 'fs/promises';
import { NextRequest } from 'next/server';

const collectionsPath = 'src/db/collections.json';

export async function GET() {
  try {
    return new Response(JSON.stringify(collectionsData), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to fetch collections' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newCollection = await request.json();
    const newId = Math.max(...collectionsData.map((c) => c.id)) + 1;
    const collectionToAdd = {
      id: newId,
      ...newCollection,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedCollections = [...collectionsData, collectionToAdd];
    await writeFile(collectionsPath, JSON.stringify(updatedCollections, null, 2));

    return new Response(JSON.stringify(collectionToAdd), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to create collection' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { id, ...updatedData } = await request.json();
    const collectionIndex = collectionsData.findIndex((c) => c.id === id);

    if (collectionIndex === -1) {
      return Response.json({ error: 'Collection not found' }, { status: 404 });
    }

    const updatedCollection = {
      ...collectionsData[collectionIndex],
      ...updatedData,
      updatedAt: new Date().toISOString(),
    };

    const updatedCollections = [...collectionsData];
    updatedCollections[collectionIndex] = updatedCollection;

    await writeFile(collectionsPath, JSON.stringify(updatedCollections, null, 2));

    return new Response(JSON.stringify(updatedCollection), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return Response.json({ error: 'Failed to update collection' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    const updatedCollections = collectionsData.filter((c) => c.id !== id);

    if (updatedCollections.length === collectionsData.length) {
      return Response.json({ error: 'Collection not found' }, { status: 404 });
    }

    await writeFile(collectionsPath, JSON.stringify(updatedCollections, null, 2));

    return new Response(null, { status: 204 });
  } catch (error) {
    return Response.json({ error: 'Failed to delete collection' }, { status: 500 });
  }
}
