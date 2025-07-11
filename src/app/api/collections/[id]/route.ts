import { NextRequest } from 'next/server';
import { getCollectionById } from '../utils';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger, PerformanceTracker } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    const tracker = new PerformanceTracker('GET /api/collections/[id]');
    const { searchParams } = new URL(request.url);
    const collectionId = Number(searchParams.get('id'));

    if (isNaN(collectionId)) {
      logger.warn(
        {
          endpoint: '/api/collections/[id]',
          method: 'GET',
          error: 'Invalid collection ID',
          providedId: searchParams.get('id'),
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
