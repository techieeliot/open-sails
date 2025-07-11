import { NextRequest } from 'next/server';
import { getUsers } from './utils';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger, PerformanceTracker } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    const tracker = new PerformanceTracker('GET /api/users');
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('id');

    logger.info(
      {
        endpoint: '/api/users',
        method: 'GET',
        userId: userId || 'all',
        type: 'users_fetch_started',
      },
      userId ? `Fetching user: ${userId}` : 'Fetching all users',
    );

    const users = await getUsers();

    if (userId) {
      const userIdNum = Number(userId);
      if (isNaN(userIdNum)) {
        logger.warn(
          {
            endpoint: '/api/users',
            method: 'GET',
            error: 'Invalid user ID',
            providedId: userId,
            type: 'validation_error',
          },
          'GET request with invalid user ID',
        );

        response = Response.json({ error: 'Invalid user ID' }, { status: 400 });
        logResponse(request, response, startTime);
        return response;
      }

      const user = users.find((u) => u.id === userIdNum);

      if (!user) {
        logger.warn(
          {
            endpoint: '/api/users',
            method: 'GET',
            userId: userIdNum,
            type: 'user_not_found',
          },
          `User not found: ${userIdNum}`,
        );

        response = Response.json({ error: 'User not found' }, { status: 404 });
        logResponse(request, response, startTime);
        return response;
      }

      tracker.finish({ userId: userIdNum });

      response = new Response(JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
      });

      logger.info(
        {
          endpoint: '/api/users',
          method: 'GET',
          userId: userIdNum,
          type: 'user_fetched',
        },
        `Successfully fetched user: ${userIdNum}`,
      );
    } else {
      tracker.finish({ count: users.length });

      response = new Response(JSON.stringify(users), {
        headers: { 'Content-Type': 'application/json' },
      });

      logger.info(
        {
          endpoint: '/api/users',
          method: 'GET',
          usersCount: users.length,
          type: 'users_fetched',
        },
        `Fetched ${users.length} users`,
      );
    }
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/users',
        method: 'GET',
        error: (error as Error).message,
        type: 'users_fetch_error',
      },
      `Failed to fetch users: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: `Failed to fetch users: ${(error as Error).message}` },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}
