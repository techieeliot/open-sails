import { NextRequest } from 'next/server';
import { getCollectionById, updateCollection, deleteCollection } from '../utils';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger, PerformanceTracker } from '@/lib/logger';
import { API_ENDPOINTS, API_METHODS, CONTENT_TYPE_JSON } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;
  const url = new URL(request.url);
  const id = url.pathname.split('/').pop();

  const getCollectionPayload = {
    endpoint: `${API_ENDPOINTS.collections}/[id]`,
    method: API_METHODS.GET,
    providedId: id,
    error: '',
    type: 'initial_get',
  };

  try {
    const tracker = new PerformanceTracker(`GET ${API_ENDPOINTS.collections}/[id]`);
    const collectionId = Number(id);
    if (isNaN(collectionId)) {
      logger.warn(
        { ...getCollectionPayload, error: 'Invalid collection ID', type: 'validation_error' },
        'GET request with invalid collection ID',
      );
      response = Response.json({ error: 'Invalid collection ID' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }
    logger.info(
      { ...getCollectionPayload, collectionId, type: 'collection_fetch_started' },
      `Fetching collection: ${collectionId}`,
    );
    const collection = await getCollectionById(collectionId);
    if (!collection) {
      logger.warn(
        { ...getCollectionPayload, collectionId, type: 'collection_not_found' },
        `Collection not found: ${collectionId}`,
      );
      response = Response.json({ error: 'Collection not found' }, { status: 404 });
      logResponse(request, response, startTime);
      return response;
    }
    tracker.finish({ collectionId });
    response = new Response(JSON.stringify(collection), {
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });
    logger.info(
      { ...getCollectionPayload, collectionId, type: 'collection_fetched' },
      `Successfully fetched collection: ${collectionId}`,
    );
  } catch (error) {
    logger.error(
      { ...getCollectionPayload, error: (error as Error).message, type: 'collection_fetch_error' },
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
  const putCollectionPayload = {
    endpoint: `${API_ENDPOINTS.collections}/[id]`,
    method: API_METHODS.PUT,
    providedId: id,
    error: '',
    type: 'initial_put',
  };
  try {
    const tracker = new PerformanceTracker(`PUT ${API_ENDPOINTS.collections}/[id]`);
    const collectionId = Number(id);
    if (isNaN(collectionId)) {
      logger.warn(
        { ...putCollectionPayload, error: 'Invalid collection ID', type: 'validation_error' },
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
        { ...putCollectionPayload, collectionId, type: 'collection_not_found' },
        `Collection not found for update: ${collectionId}`,
      );
      response = Response.json({ error: 'Collection not found' }, { status: 404 });
      logResponse(request, response, startTime);
      return response;
    }
    // Get the updated data from the request body
    const updatedData = await request.json();
    logger.info(
      { ...putCollectionPayload, collectionId, type: 'collection_update_started' },
      `Updating collection: ${collectionId}`,
    );
    // Update the collection
    const updatedCollection = await updateCollection(collectionId, updatedData);
    tracker.finish({ collectionId });
    response = new Response(JSON.stringify(updatedCollection), {
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });
    logger.info(
      { ...putCollectionPayload, collectionId, type: 'collection_updated' },
      `Successfully updated collection: ${collectionId}`,
    );
  } catch (error) {
    logger.error(
      { ...putCollectionPayload, error: (error as Error).message, type: 'collection_update_error' },
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
  const deleteCollectionPayload = {
    endpoint: `${API_ENDPOINTS.collections}/[id]`,
    method: API_METHODS.DELETE,
    providedId: id,
    error: '',
    type: 'initial_delete',
  };

  try {
    const tracker = new PerformanceTracker(`DELETE ${API_ENDPOINTS.collections}/[id]`);
    const collectionId = Number(id);

    if (isNaN(collectionId)) {
      logger.warn(
        { ...deleteCollectionPayload, error: 'Invalid collection ID', type: 'validation_error' },
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
        { ...deleteCollectionPayload, error: 'Collection not found', type: 'collection_not_found' },
        `Collection not found for deletion: ${collectionId}`,
      );

      response = Response.json({ error: 'Collection not found' }, { status: 404 });
      logResponse(request, response, startTime);
      return response;
    }

    logger.info(
      {
        ...deleteCollectionPayload,
        type: 'collection_delete_started',
      },
      `Deleting collection: ${collectionId}`,
    );

    // Delete the collection
    await deleteCollection(collectionId);

    tracker.finish({ collectionId });

    response = new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });

    logger.info(
      {
        ...deleteCollectionPayload,
        type: 'collection_deleted',
      },
      `Successfully deleted collection: ${collectionId}`,
    );
  } catch (error) {
    logger.error(
      {
        ...deleteCollectionPayload,
        error: (error as Error).cause || (error as Error).message,
        details: (error as Error).stack,
        type: 'collection_delete_error',
      },
      `Failed to delete collection: ${(error as Error).message}`,
    );

    response = Response.json(
      {
        error: 'Failed to delete collection: ' + (error as Error).message,
        details: (error as Error).stack,
      },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}
