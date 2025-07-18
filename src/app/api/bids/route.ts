import type { NextRequest } from 'next/server';

import { invalidateBidAndCollectionCache } from '@/db/cache-invalidation';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { API_ENDPOINTS, API_METHODS, CONTENT_TYPE_JSON } from '@/lib/constants';
import { logger, PerformanceTracker } from '@/lib/logger';

import {
  createBid,
  deleteBid,
  getBidById,
  getBidsByCollectionId,
  updateBid,
  updateBidStatus,
} from './utils';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  const getBidsPayload = {
    endpoint: API_ENDPOINTS.bids,
    method: API_METHODS.GET,
    error: '',
    type: 'initial_get',
  };
  try {
    const tracker = new PerformanceTracker('GET /api/bids');
    const searchParams = request.nextUrl.searchParams;
    const collectionId = searchParams.get('collection_id');
    const bidId = searchParams.get('bid_id');

    // Check if we're fetching a single bid
    if (bidId) {
      const bidIdNum = Number(bidId);
      if (Number.isNaN(bidIdNum)) {
        logger.warn(
          {
            ...getBidsPayload,
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
        { ...getBidsPayload, bidId: bidIdNum, type: 'bid_fetch_started' },
        `Fetching bid: ${bidIdNum}`,
      );
      const bid = await getBidById(bidIdNum);
      if (!bid) {
        logger.warn(
          { ...getBidsPayload, bidId: bidIdNum, type: 'bid_not_found' },
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
        { ...getBidsPayload, error: 'Missing collection ID', type: 'validation_error' },
        'GET request missing collection ID',
      );
      response = Response.json({ error: 'Collection ID is required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }
    const collectionIdNum = Number(collectionId);
    if (Number.isNaN(collectionIdNum)) {
      logger.warn(
        {
          ...getBidsPayload,
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
      { ...getBidsPayload, collectionId: collectionIdNum, type: 'bids_fetch_started' },
      `Fetching bids for collection: ${collectionIdNum}`,
    );
    const bids = await getBidsByCollectionId(collectionIdNum);
    tracker.finish({ collectionId: collectionIdNum, count: bids.length });
    response = new Response(JSON.stringify(bids), {
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });
    logger.info(
      {
        ...getBidsPayload,
        collectionId: collectionIdNum,
        bidsCount: bids.length,
        type: 'bids_fetched',
      },
      `Fetched ${bids.length} bids for collection: ${collectionIdNum}`,
    );
  } catch (error) {
    logger.error(
      { ...getBidsPayload, error: (error as Error).message, type: 'bids_fetch_error' },
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

  const postBidPayload = {
    endpoint: API_ENDPOINTS.bids,
    method: API_METHODS.POST,
    error: '',
    type: 'initial_post',
  };
  try {
    const tracker = new PerformanceTracker('POST /api/bids');
    const newBidData = await request.json();
    logger.info(
      { ...postBidPayload, bidData: newBidData, type: 'bid_creation_started' },
      'Creating new bid',
    );
    const newBid = await createBid(newBidData);
    tracker.finish({ bidId: newBid.id });
    response = new Response(JSON.stringify(newBid), {
      status: 201,
      headers: { 'Content-Type': CONTENT_TYPE_JSON },
    });
    logger.info(
      { ...postBidPayload, bidId: newBid.id, type: 'bid_created' },
      `Created bid: ${newBid.id}`,
    );
    // Invalidate cache after creation
    await invalidateBidAndCollectionCache(newBid.id, newBid.userId);
  } catch (error) {
    logger.error(
      { ...postBidPayload, error: (error as Error).message, type: 'bid_creation_error' },
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

  const putBidPayload = {
    endpoint: API_ENDPOINTS.bids,
    method: API_METHODS.PUT,
    error: '',
    type: 'initial_put',
  };
  try {
    const tracker = new PerformanceTracker('PUT /api/bids');
    const { searchParams } = new URL(request.url);
    const bidId = searchParams.get('bid_id');
    const collectionId = searchParams.get('collection_id');
    if (!bidId || !collectionId) {
      logger.warn(
        {
          ...putBidPayload,
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
    if (Number.isNaN(bidIdNumeric) || Number.isNaN(collectionIdNumeric)) {
      logger.warn(
        {
          ...putBidPayload,
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
        ...putBidPayload,
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
      { ...putBidPayload, bidId: bidIdNumeric, type: 'bid_updated' },
      `Successfully updated bid: ${bidIdNumeric}`,
    );
  } catch (error) {
    logger.error(
      { ...putBidPayload, error: (error as Error).message, type: 'bid_update_error' },
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

  const deleteBidPayload = {
    endpoint: API_ENDPOINTS.bids,
    method: API_METHODS.DELETE,
    error: '',
    type: 'initial_delete',
  };
  try {
    const tracker = new PerformanceTracker('DELETE /api/bids');
    const { searchParams } = new URL(request.url);
    const bidId = searchParams.get('bid_id');
    if (!bidId) {
      logger.warn(
        { ...deleteBidPayload, error: 'Bid ID is required', type: 'validation_error' },
        'DELETE request missing bid ID',
      );
      response = Response.json({ error: 'Bid ID is required' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }
    logger.info(
      { ...deleteBidPayload, bidId, type: 'bid_delete_started' },
      `Deleting bid: ${bidId}`,
    );
    const bidIdNumeric = parseInt(bidId, 10);
    if (isNaN(bidIdNumeric)) {
      logger.warn(
        {
          ...deleteBidPayload,
          error: 'Invalid Bid ID',
          providedId: bidId,
          type: 'validation_error',
        },
        'DELETE request with invalid Bid ID',
      );
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
      { ...deleteBidPayload, bidId: bidIdNumeric, type: 'bid_deleted' },
      `Successfully deleted bid: ${bidIdNumeric}`,
    );
    // Invalidate cache after deletion
    await invalidateBidAndCollectionCache(bidIdNumeric);
  } catch (error) {
    logger.error(
      { ...deleteBidPayload, error: (error as Error).message, type: 'bid_delete_error' },
      `Failed to delete bid: ${(error as Error).message}`,
    );
    response = Response.json({ error: (error as Error).message }, { status: 500 });
  }
  logResponse(request, response, startTime);
  return response;
}
