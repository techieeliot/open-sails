import type { NextRequest } from 'next/server';

import { seedDatabase } from '@/db';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { API_ENDPOINTS, API_METHODS, CONTENT_TYPE_JSON } from '@/lib/constants';
import { logger, PerformanceTracker } from '@/lib/logger';

import { createCollection, deleteCollection, getCollections, updateCollection } from './utils';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  const getCollectionsPayload = {
    endpoint: API_ENDPOINTS.collections,
    method: API_METHODS.GET,
    error: '',
    type: 'initial_get',
  };

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
        ...getCollectionsPayload,
        collectionsCount: collections.length,
        type: 'collections_fetched',
      },
      `Fetched ${collections.length} collections`,
    );
  } catch (error) {
    logger.error(
      {
        ...getCollectionsPayload,
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
  const postCollectionPayload = {
    endpoint: API_ENDPOINTS.collections,
    method: API_METHODS.POST,
    error: '',
    type: 'initial_post',
  };
  try {
    const tracker = new PerformanceTracker(`POST ${API_ENDPOINTS.collections}`);
    const newCollectionData = await request.json();
    logger.info(
      {
        ...postCollectionPayload,
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
        ...postCollectionPayload,
        collectionId: newCollection.id,
        type: 'collection_created',
      },
      `Created collection: ${newCollection.id}`,
    );
  } catch (error) {
    logger.error(
      {
        ...postCollectionPayload,
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
  const putCollectionPayload = {
    endpoint: API_ENDPOINTS.collections,
    method: API_METHODS.PUT,
    error: '',
    type: 'initial_put',
  };
  try {
    const tracker = new PerformanceTracker(`PUT ${API_ENDPOINTS.collections}`);
    const { searchParams } = new URL(request.url);
    const collectionId = Number(searchParams.get('id'));
    const updatedData = await request.json();
    if (!collectionId || Number.isNaN(collectionId)) {
      logger.warn(
        { ...putCollectionPayload, error: 'Collection ID is required', type: 'validation_error' },
        'PUT request with invalid collection ID',
      );
      response = Response.json({ error: 'Collection ID is required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }
    logger.info(
      {
        ...putCollectionPayload,
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
        ...putCollectionPayload,
        collectionId: collectionId,
        type: 'collection_updated',
      },
      `Successfully updated collection: ${collectionId}`,
    );
  } catch (error) {
    logger.error(
      {
        ...putCollectionPayload,
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
  const deleteCollectionPayload = {
    endpoint: API_ENDPOINTS.collections,
    method: API_METHODS.DELETE,
    error: '',
    type: 'initial_delete',
  };
  try {
    const tracker = new PerformanceTracker(`DELETE ${API_ENDPOINTS.collections}`);
    const { searchParams } = new URL(request.url);
    const collectionId = Number(searchParams.get('id'));
    if (!collectionId || Number.isNaN(collectionId)) {
      logger.warn(
        {
          ...deleteCollectionPayload,
          error: 'Collection ID is required',
          type: 'validation_error',
        },
        'DELETE request with invalid collection ID',
      );
      response = Response.json({ error: 'Collection ID is required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }
    logger.info(
      {
        ...deleteCollectionPayload,
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
        ...deleteCollectionPayload,
        collectionId: collectionId,
        type: 'collection_deleted',
      },
      `Successfully deleted collection: ${collectionId}`,
    );
  } catch (error) {
    logger.error(
      {
        ...deleteCollectionPayload,
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
