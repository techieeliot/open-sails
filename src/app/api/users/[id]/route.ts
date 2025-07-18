import type { NextRequest } from 'next/server';

import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger, PerformanceTracker } from '@/lib/logger';

import { getUserById } from '../utils';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;
  // Extract the user ID from the URL path
  const url = new URL(request.url);
  const pathSegments = url.pathname.split('/');
  const id = pathSegments[pathSegments.length - 1];

  try {
    const tracker = new PerformanceTracker('GET /api/users/[id]');
    const userId = parseInt(id, 10);

    if (Number.isNaN(userId)) {
      response = Response.json({ error: 'Invalid user ID' }, { status: 400 });
      logResponse(request, response, startTime);
      return response;
    }

    logger.info(
      {
        endpoint: '/api/users/[id]',
        method: GET,
        userId,
        type: 'user_fetch_started',
      },
      `Fetching user: ${userId}`,
    );

    const user = await getUserById(userId);

    if (!user) {
      logger.warn(
        {
          endpoint: '/api/users/[id]',
          method: GET,
          userId,
          type: 'user_not_found',
        },
        `User not found: ${userId}`,
      );

      response = Response.json({ error: 'User not found' }, { status: 404 });
      logResponse(request, response, startTime);
      return response;
    }

    tracker.finish({ userId });

    response = new Response(JSON.stringify(user), {
      headers: { 'Content-Type': 'application/json' },
    });

    logger.info(
      {
        endpoint: '/api/users/[id]',
        method: GET,
        userId,
        type: 'user_fetched',
      },
      `Successfully fetched user: ${userId}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/users/[id]',
        method: GET,
        userId: id,
        error: (error as Error).message,
        type: 'user_fetch_error',
      },
      `Failed to fetch user ${id}: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: `Failed to fetch user: ${(error as Error).message}` },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}
