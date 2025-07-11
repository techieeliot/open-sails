import { NextRequest } from 'next/server';
import { createCollection, deleteCollection, getCollections, updateCollection } from './utils';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger, PerformanceTracker } from '@/lib/logger';
import { seedDatabase } from '@/db';
import { API_ENDPOINTS, API_METHODS, CONTENT_TYPE_JSON } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    await seedDatabase();

    const tracker = new PerformanceTracker(`GET ${API_ENDPOINTS.collections}`);
    const collections = await getCollections();
    tracker.finish({ count: collections.length });

    response = new Response(JSON.stringify(collections), {
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });

    logger.info(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.GET,
        collectionsCount: collections.length,
        type: 'collections_fetched',
      },
      `Fetched ${collections.length} collections`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.GET,
        error: (error as Error).message,
        type: 'collections_fetch_error',
      },
      `Failed to fetch collections: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: `Failed to fetch collections: ${(error as Error).message}` },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}

export async function POST(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    const tracker = new PerformanceTracker(`POST ${API_ENDPOINTS.collections}`);
    const newCollectionData = await request.json();

    logger.info(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.POST,
        collectionData: newCollectionData,
        type: 'collection_creation_started',
      },
      'Creating new collection',
    );

    const newCollection = await createCollection(newCollectionData);
    tracker.finish({ collectionId: newCollection.id });

    response = new Response(JSON.stringify(newCollection), {
      status: 201,
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });

    logger.info(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.POST,
        collectionId: newCollection.id,
        type: 'collection_created',
      },
      `Created collection: ${newCollection.id}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.POST,
        error: (error as Error).message,
        type: 'collection_creation_error',
      },
      `Failed to create collection: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: `Failed to create collection: ${(error as Error).message}` },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}

export async function PUT(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    const tracker = new PerformanceTracker(`PUT ${API_ENDPOINTS.collections}`);
    const { searchParams } = new URL(request.url);
    const collectionId = Number(searchParams.get('id'));
    const updatedData = await request.json();

    if (!collectionId || isNaN(collectionId)) {
      response = Response.json({ error: 'Collection ID is required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    logger.info(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.PUT,
        collectionId: collectionId,
        type: 'collection_update_started',
      },
      `Updating collection: ${collectionId}`,
    );

    const updatedCollection = await updateCollection(collectionId, updatedData);
    tracker.finish({ collectionId: collectionId });

    response = new Response(JSON.stringify(updatedCollection), {
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });

    logger.info(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.PUT,
        collectionId: collectionId,
        type: 'collection_updated',
      },
      `Successfully updated collection: ${collectionId}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.PUT,
        error: (error as Error).message,
        type: 'collection_update_error',
      },
      `Failed to update collection: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: `Failed to update collection: ${(error as Error).message}` },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}

export async function DELETE(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    const tracker = new PerformanceTracker(`DELETE ${API_ENDPOINTS.collections}`);
    const { searchParams } = new URL(request.url);
    const collectionId = Number(searchParams.get('id'));

    if (!collectionId || isNaN(collectionId)) {
      response = Response.json({ error: 'Collection ID is required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    logger.info(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.DELETE,
        collectionId: collectionId,
        type: 'collection_delete_started',
      },
      `Deleting collection: ${collectionId}`,
    );

    await deleteCollection(collectionId);
    tracker.finish({ collectionId: collectionId });

    response = new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });

    logger.info(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.DELETE,
        collectionId: collectionId,
        type: 'collection_deleted',
      },
      `Successfully deleted collection: ${collectionId}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: API_ENDPOINTS.collections,
        method: API_METHODS.DELETE,
        error: (error as Error).message,
        type: 'collection_delete_error',
      },
      `Failed to delete collection: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: `Failed to delete collection: ${(error as Error).message}` },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}
