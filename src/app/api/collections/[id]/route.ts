import { NextRequest } from 'next/server';
import { getCollectionById, updateCollection, deleteCollection } from '../utils';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger, PerformanceTracker } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  try {
    const tracker = new PerformanceTracker('GET /api/collections/[id]');
    const collectionId = Number(id);

    if (isNaN(collectionId)) {
      logger.warn(
        {
          endpoint: '/api/collections/[id]',
          method: 'GET',
          error: 'Invalid collection ID',
          providedId: id,
          type: 'validation_error',
        },
        'GET request with invalid collection ID',
      );

      response = Response.json({ error: 'Invalid collection ID' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    logger.info(
      {
        endpoint: '/api/collections/[id]',
        method: 'GET',
        collectionId,
        type: 'collection_fetch_started',
      },
      `Fetching collection: ${collectionId}`,
    );

    const collection = await getCollectionById(collectionId);

    if (!collection) {
      logger.warn(
        {
          endpoint: '/api/collections/[id]',
          method: 'GET',
          collectionId,
          type: 'collection_not_found',
        },
        `Collection not found: ${collectionId}`,
      );

      response = Response.json({ error: 'Collection not found' }, { status: 404 });
      logResponse(request, response, startTime);
      return response;
    }

    tracker.finish({ collectionId });

    response = new Response(JSON.stringify(collection), {
      headers: { 'Content-Type': 'application/json' },
    });

    logger.info(
      {
        endpoint: '/api/collections/[id]',
        method: 'GET',
        collectionId,
        type: 'collection_fetched',
      },
      `Successfully fetched collection: ${collectionId}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/collections/[id]',
        method: 'GET',
        error: (error as Error).message,
        type: 'collection_fetch_error',
      },
      `Failed to fetch collection: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: 'Failed to fetch collection: ' + (error as Error).message },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}

export async function PUT(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  try {
    const tracker = new PerformanceTracker('PUT /api/collections/[id]');
    const collectionId = Number(id);

    if (isNaN(collectionId)) {
      logger.warn(
        {
          endpoint: '/api/collections/[id]',
          method: 'PUT',
          error: 'Invalid collection ID',
          providedId: id,
          type: 'validation_error',
        },
        'PUT request with invalid collection ID',
      );

      response = Response.json({ error: 'Invalid collection ID' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    // Get the collection first to verify it exists
    const existingCollection = await getCollectionById(collectionId);

    if (!existingCollection) {
      logger.warn(
        {
          endpoint: '/api/collections/[id]',
          method: 'PUT',
          collectionId,
          type: 'collection_not_found',
        },
        `Collection not found for update: ${collectionId}`,
      );

      response = Response.json({ error: 'Collection not found' }, { status: 404 });
      logResponse(request, response, startTime);
      return response;
    }

    // Get the updated data from the request body
    const updatedData = await request.json();

    logger.info(
      {
        endpoint: '/api/collections/[id]',
        method: 'PUT',
        collectionId,
        type: 'collection_update_started',
      },
      `Updating collection: ${collectionId}`,
    );

    // Update the collection
    const updatedCollection = await updateCollection(collectionId, updatedData);

    tracker.finish({ collectionId });

    response = new Response(JSON.stringify(updatedCollection), {
      headers: { 'Content-Type': 'application/json' },
    });

    logger.info(
      {
        endpoint: '/api/collections/[id]',
        method: 'PUT',
        collectionId,
        type: 'collection_updated',
      },
      `Successfully updated collection: ${collectionId}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/collections/[id]',
        method: 'PUT',
        error: (error as Error).message,
        type: 'collection_update_error',
      },
      `Failed to update collection: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: 'Failed to update collection: ' + (error as Error).message },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}

export async function DELETE(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  try {
    const tracker = new PerformanceTracker('DELETE /api/collections/[id]');
    const collectionId = Number(id);

    if (isNaN(collectionId)) {
      logger.warn(
        {
          endpoint: '/api/collections/[id]',
          method: 'DELETE',
          error: 'Invalid collection ID',
          providedId: id,
          type: 'validation_error',
        },
        'DELETE request with invalid collection ID',
      );

      response = Response.json({ error: 'Invalid collection ID' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    // Get the collection first to verify it exists
    const existingCollection = await getCollectionById(collectionId);

    if (!existingCollection) {
      logger.warn(
        {
          endpoint: '/api/collections/[id]',
          method: 'DELETE',
          collectionId,
          type: 'collection_not_found',
        },
        `Collection not found for deletion: ${collectionId}`,
      );

      response = Response.json({ error: 'Collection not found' }, { status: 404 });
      logResponse(request, response, startTime);
      return response;
    }

    logger.info(
      {
        endpoint: '/api/collections/[id]',
        method: 'DELETE',
        collectionId,
        type: 'collection_delete_started',
      },
      `Deleting collection: ${collectionId}`,
    );

    // Delete the collection
    await deleteCollection(collectionId);

    tracker.finish({ collectionId });

    response = new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    });

    logger.info(
      {
        endpoint: '/api/collections/[id]',
        method: 'DELETE',
        collectionId,
        type: 'collection_deleted',
      },
      `Successfully deleted collection: ${collectionId}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/collections/[id]',
        method: 'DELETE',
        error: (error as Error).message,
        type: 'collection_delete_error',
      },
      `Failed to delete collection: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: 'Failed to delete collection: ' + (error as Error).message },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}
