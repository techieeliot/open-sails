import { NextRequest } from 'next/server';
import { logger, MetricsTracker } from '@/lib/logger';
import { logRequest, logResponse } from '@/lib/api-middleware';

export async function POST(request: NextRequest) {
  const startTime = logRequest(request);

  try {
    const { action, userId, metadata, timestamp } = await request.json();

    // Track engagement metrics
    const metrics = MetricsTracker.getInstance();
    metrics.trackUserEngagement(action, userId);

    // Log detailed engagement data
    logger.info(
      {
        action,
        userId,
        metadata,
        timestamp,
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for'),
        type: 'user_engagement',
      },
      `User engagement: ${action}`,
    );

    const response = new Response(
      JSON.stringify({
        message: 'Engagement tracked successfully',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    logResponse(request, response, startTime);
    return response;
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/engagement',
        error: (error as Error).message,
        type: 'engagement_tracking_error',
      },
      `Failed to track engagement: ${(error as Error).message}`,
    );

    const response = Response.json(
      { error: `Failed to track engagement: ${(error as Error).message}` },
      { status: 500 },
    );

    logResponse(request, response, startTime);
    return response;
  }
}
