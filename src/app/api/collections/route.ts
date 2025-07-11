import { NextRequest } from 'next/server';
import { createCollection, deleteCollection, getCollections, updateCollection } from './utils';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger, PerformanceTracker } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    const tracker = new PerformanceTracker('GET /api/collections');
    const collections = await getCollections();
    tracker.finish({ count: collections.length });

    response = new Response(JSON.stringify(collections), {
      headers: { 'Content-Type': 'application/json' },
    });

    logger.info(
      {
        endpoint: '/api/collections',
        method: 'GET',
        collectionsCount: collections.length,
        type: 'collections_fetched',
      },
      `Fetched ${collections.length} collections`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/collections',
        method: 'GET',
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
    const tracker = new PerformanceTracker('POST /api/collections');
    const newCollectionData = await request.json();

    logger.info(
      {
        endpoint: '/api/collections',
        method: 'POST',
        collectionData: newCollectionData,
        type: 'collection_creation_started',
      },
      'Creating new collection',
    );

    const newCollection = await createCollection(newCollectionData);
    tracker.finish({ collectionId: newCollection.id });

    response = new Response(JSON.stringify(newCollection), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });

    logger.info(
      {
        endpoint: '/api/collections',
        method: 'POST',
        collectionId: newCollection.id,
        type: 'collection_created',
      },
      `Created collection: ${newCollection.id}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/collections',
        method: 'POST',
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
    const tracker = new PerformanceTracker('PUT /api/collections');
    const { id, ...updatedData } = await request.json();

    if (!id) {
      logger.warn(
        {
          endpoint: '/api/collections',
          method: 'PUT',
          error: 'Missing collection ID',
          type: 'validation_error',
        },
        'PUT request missing collection ID',
      );

      response = Response.json({ error: 'Collection ID is required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    logger.info(
      {
        endpoint: '/api/collections',
        method: 'PUT',
        collectionId: id,
        updateData: updatedData,
        type: 'collection_update_started',
      },
      `Updating collection: ${id}`,
    );

    const updatedCollection = await updateCollection(id, updatedData);
    tracker.finish({ collectionId: id });

    response = new Response(JSON.stringify(updatedCollection), {
      headers: { 'Content-Type': 'application/json' },
    });

    logger.info(
      {
        endpoint: '/api/collections',
        method: 'PUT',
        collectionId: id,
        type: 'collection_updated',
      },
      `Updated collection: ${id}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/collections',
        method: 'PUT',
        error: (error as Error).message,
        type: 'collection_update_error',
      },
      `Failed to update collection: ${(error as Error).message}`,
    );

    response = Response.json({ error: (error as Error).message }, { status: 500 });
  }

  logResponse(request, response, startTime);
  return response;
}

export async function DELETE(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    const tracker = new PerformanceTracker('DELETE /api/collections');
    const { id } = await request.json();

    if (!id) {
      logger.warn(
        {
          endpoint: '/api/collections',
          method: 'DELETE',
          error: 'Missing collection ID',
          type: 'validation_error',
        },
        'DELETE request missing collection ID',
      );

      response = Response.json({ error: 'Collection ID is required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    logger.info(
      {
        endpoint: '/api/collections',
        method: 'DELETE',
        collectionId: id,
        type: 'collection_deletion_started',
      },
      `Deleting collection: ${id}`,
    );

    await deleteCollection(id);
    tracker.finish({ collectionId: id });

    response = new Response(null, { status: 204 });

    logger.info(
      {
        endpoint: '/api/collections',
        method: 'DELETE',
        collectionId: id,
        type: 'collection_deleted',
      },
      `Deleted collection: ${id}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/collections',
        method: 'DELETE',
        error: (error as Error).message,
        type: 'collection_deletion_error',
      },
      `Failed to delete collection: ${(error as Error).message}`,
    );

    response = Response.json({ error: (error as Error).message }, { status: 500 });
  }

  logResponse(request, response, startTime);
  return response;
}
