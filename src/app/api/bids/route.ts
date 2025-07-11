import { NextRequest } from 'next/server';
import {
  createBid,
  deleteBid,
  getBidById,
  getBidsByCollectionId,
  updateBid,
  updateBidStatus,
} from './utils';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger, PerformanceTracker } from '@/lib/logger';
import { API_ENDPOINTS, API_METHODS, CONTENT_TYPE_JSON } from '@/lib/constants';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    const tracker = new PerformanceTracker('GET /api/bids');
    const searchParams = request.nextUrl.searchParams;
    const collectionId = searchParams.get('collection_id');
    const bidId = searchParams.get('bid_id');

    // Check if we're fetching a single bid
    if (bidId) {
      const bidIdNum = Number(bidId);
      if (isNaN(bidIdNum)) {
        logger.warn(
          {
            endpoint: API_ENDPOINTS.bids,
            method: GET,
            error: 'Invalid bid ID',
            providedId: bidId,
            type: 'validation_error',
          },
          'GET request with invalid bid ID',
        );

        response = Response.json({ error: 'Invalid bid ID' }, { status: 400 });
        logResponse(request, response, startTime);
        return response;
      }

      logger.info(
        {
          endpoint: API_ENDPOINTS.bids,
          method: GET,
          bidId: bidIdNum,
          type: 'bid_fetch_started',
        },
        `Fetching bid: ${bidIdNum}`,
      );

      const bid = await getBidById(bidIdNum);

      if (!bid) {
        logger.warn(
          {
            endpoint: API_ENDPOINTS.bids,
            method: API_METHODS.GET,
            bidId: bidIdNum,
            type: 'bid_not_found',
          },
          `Bid not found: ${bidIdNum}`,
        );

        response = Response.json({ error: 'Bid not found' }, { status: 404 });
        logResponse(request, response, startTime);
        return response;
      }

      tracker.finish({ bidId: bidIdNum });

      response = new Response(JSON.stringify(bid), {
        headers: { 'Content-Type': CONTENT_TYPE_JSON },
      });
      logResponse(request, response, startTime);
      return response;
    }

    // Handling collection bids
    if (!collectionId) {
      logger.warn(
        {
          endpoint: API_ENDPOINTS.bids,
          method: GET,
          error: 'Missing collection ID',
          type: 'validation_error',
        },
        'GET request missing collection ID',
      );

      response = Response.json({ error: 'Collection ID is required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    const collectionIdNum = Number(collectionId);
    if (isNaN(collectionIdNum)) {
      logger.warn(
        {
          endpoint: API_ENDPOINTS.bids,
          method: GET,
          error: 'Invalid collection ID',
          providedId: collectionId,
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
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.GET,
        collectionId: collectionIdNum,
        type: 'bids_fetch_started',
      },
      `Fetching bids for collection: ${collectionIdNum}`,
    );

    const bids = await getBidsByCollectionId(collectionIdNum);
    tracker.finish({ collectionId: collectionIdNum, count: bids.length });

    response = new Response(JSON.stringify(bids), {
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });

    logger.info(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.GET,
        collectionId: collectionIdNum,
        bidsCount: bids.length,
        type: 'bids_fetched',
      },
      `Fetched ${bids.length} bids for collection: ${collectionIdNum}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.GET,
        error: (error as Error).message,
        type: 'bids_fetch_error',
      },
      `Failed to fetch bids: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: 'Failed to fetch bids: ' + (error as Error).message },
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
    const tracker = new PerformanceTracker('POST /api/bids');
    const newBidData = await request.json();

    logger.info(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.POST,
        bidData: newBidData,
        type: 'bid_creation_started',
      },
      'Creating new bid',
    );

    const newBid = await createBid(newBidData);
    tracker.finish({ bidId: newBid.id });

    response = new Response(JSON.stringify(newBid), {
      status: 201,
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });

    logger.info(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.POST,
        bidId: newBid.id,
        type: 'bid_created',
      },
      `Created bid: ${newBid.id}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.POST,
        error: (error as Error).message,
        type: 'bid_creation_error',
      },
      `Failed to create bid: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: 'Failed to create bid: ' + (error as Error).message },
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
    const tracker = new PerformanceTracker('PUT /api/bids');
    const { searchParams } = new URL(request.url);
    const bidId = searchParams.get('bid_id');
    const collectionId = searchParams.get('collection_id');

    if (!bidId || !collectionId) {
      logger.warn(
        {
          endpoint: API_ENDPOINTS.bids,
          method: PUT,
          error: 'Missing bid or collection ID',
          providedBidId: bidId,
          providedCollectionId: collectionId,
          type: 'validation_error',
        },
        'PUT request missing required IDs',
      );

      response = Response.json({ error: 'Bid and Collection ID are required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    const bidIdNumeric = Number(bidId);
    const collectionIdNumeric = Number(collectionId);

    if (isNaN(bidIdNumeric) || isNaN(collectionIdNumeric)) {
      logger.warn(
        {
          endpoint: API_ENDPOINTS.bids,
          method: PUT,
          error: 'Invalid bid or collection ID',
          providedBidId: bidId,
          providedCollectionId: collectionId,
          type: 'validation_error',
        },
        'PUT request with invalid IDs',
      );

      response = Response.json({ error: 'Invalid Bid or Collection ID' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    const requestBody = await request.json();
    const { status, ...updatedData } = requestBody;

    logger.info(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.PUT,
        bidId: bidIdNumeric,
        collectionId: collectionIdNumeric,
        updateType: status ? 'status' : 'data',
        type: 'bid_update_started',
      },
      `Updating bid: ${bidIdNumeric}`,
    );

    if (status) {
      await updateBidStatus(bidIdNumeric, status, collectionIdNumeric);
      response = new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': CONTENT_TYPE_JSON },
      });
    } else {
      const updatedBid = await updateBid(bidIdNumeric, updatedData);
      response = new Response(JSON.stringify(updatedBid), {
        headers: { 'Content-Type': CONTENT_TYPE_JSON },
      });
    }

    tracker.finish({ bidId: bidIdNumeric });

    logger.info(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.PUT,
        bidId: bidIdNumeric,
        type: 'bid_updated',
      },
      `Successfully updated bid: ${bidIdNumeric}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.PUT,
        error: (error as Error).message,
        type: 'bid_update_error',
      },
      `Failed to update bid: ${(error as Error).message}`,
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
    const tracker = new PerformanceTracker('DELETE /api/bids');
    const { searchParams } = new URL(request.url);
    const bidId = searchParams.get('bid_id');

    if (!bidId) {
      response = Response.json({ error: 'Bid ID is required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    logger.info(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.DELETE,
        bidId,
        type: 'bid_delete_started',
      },
      `Deleting bid: ${bidId}`,
    );

    const bidIdNumeric = parseInt(bidId, 10);
    if (isNaN(bidIdNumeric)) {
      response = Response.json({ error: 'Invalid Bid ID' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    await deleteBid(bidIdNumeric);
    tracker.finish({ bidId: bidIdNumeric });

    response = new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });

    logger.info(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.DELETE,
        bidId: bidIdNumeric,
        type: 'bid_deleted',
      },
      `Successfully deleted bid: ${bidIdNumeric}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: API_ENDPOINTS.bids,
        method: API_METHODS.DELETE,
        error: (error as Error).message,
        type: 'bid_delete_error',
      },
      `Failed to delete bid: ${(error as Error).message}`,
    );

    response = Response.json({ error: (error as Error).message }, { status: 500 });
  }

  logResponse(request, response, startTime);
  return response;
}
