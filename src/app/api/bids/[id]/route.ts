import type { NextRequest } from 'next/server';

import { logRequest, logResponse } from '@/lib/api-middleware';
import { API_ENDPOINTS, API_METHODS } from '@/lib/constants';
import { ensureDatabaseInitialized } from '@/lib/db-init';
import { logger, PerformanceTracker } from '@/lib/logger';

import { getBidById } from '../utils';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  const getBidPayload = {
    endpoint: `${API_ENDPOINTS.bids}/[id]`,
    method: API_METHODS.GET,
    providedId: '',
    error: '',
    type: 'initial_get',
  };

  try {
    await ensureDatabaseInitialized();

    const tracker = new PerformanceTracker('GET /api/bids/[id]');
    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');
    const bidId = Number(pathSegments[pathSegments.length - 1]);

    if (Number.isNaN(bidId)) {
      logger.warn(
        {
          ...getBidPayload,
          error: 'Invalid bid ID',
          providedId: pathSegments[pathSegments.length - 1],
          type: 'validation_error',
        },
        'GET request with invalid bid ID',
      );

      response = Response.json({ error: 'Invalid bid ID' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    getBidPayload.providedId = String(bidId);

    logger.info(
      {
        ...getBidPayload,
        providedId: bidId,
        type: 'bid_fetch_started',
      },
      `Fetching bid: ${bidId}`,
    );

    const bid = await getBidById(bidId);

    if (!bid) {
      logger.warn(
        {
          ...getBidPayload,
          type: 'bid_not_found',
        },
        `Bid not found: ${bidId}`,
      );

      response = Response.json({ error: 'Bid not found' }, { status: 404 });
      logResponse(request, response, startTime);
      return response;
    }

    tracker.finish({ bidId });

    response = new Response(JSON.stringify(bid), {
      headers: { 'Content-Type': 'application/json' },
    });

    logger.info(
      {
        ...getBidPayload,
        type: 'bid_fetched',
      },
      `Successfully fetched bid: ${bidId}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/bids/[id]',
        method: GET,
        error: (error as Error).message,
        type: 'bid_fetch_error',
      },
      `Failed to fetch bid: ${(error as Error).message}`,
    );

    response = Response.json({ error: (error as Error).message }, { status: 500 });
  }

  logResponse(request, response, startTime);
  return response;
}
