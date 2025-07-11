import { NextRequest } from 'next/server';
import { getUsers } from './utils';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger, PerformanceTracker } from '@/lib/logger';
import { seedDatabase } from '@/db';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    await seedDatabase();

    const tracker = new PerformanceTracker('GET /api/users');
    const { searchParams } = new URL(request.url);
    const userIdStr = searchParams.get('id');

    logger.info(
      {
        endpoint: '/api/users',
        method: 'GET',
        userId: userIdStr || 'all',
        type: 'users_fetch_started',
      },
      userIdStr ? `Fetching user: ${userIdStr}` : 'Fetching all users',
    );

    const users = await getUsers();

    if (userIdStr) {
      const userId = parseInt(userIdStr, 10);
      const user = users.find((u) => u.id === userId);

      if (!user) {
        logger.warn(
          {
            endpoint: '/api/users',
            method: 'GET',
            userId: userId,
            type: 'user_not_found',
          },
          `User not found: ${userId}`,
        );

        response = Response.json({ error: 'User not found' }, { status: 404 });
        logResponse(request, response, startTime);
        return response;
      }

      tracker.finish({ userId: userId });

      response = new Response(JSON.stringify(user), {
        headers: { 'Content-Type': 'application/json' },
      });

      logger.info(
        {
          endpoint: '/api/users',
          method: 'GET',
          userId: userId,
          type: 'user_fetched',
        },
        `Successfully fetched user: ${userId}`,
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
