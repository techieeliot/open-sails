import { NextRequest } from 'next/server';
import { logger, MetricsTracker } from '@/lib/logger';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { API_ENDPOINTS, API_METHODS, CONTENT_TYPE_JSON, LOG_TYPES } from '@/lib/constants';

export async function POST(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

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
        type: LOG_TYPES.USER_ENGAGEMENT,
      },
      `User engagement: ${action}`,
    );

    response = new Response(
      JSON.stringify({
        message: 'Engagement tracked successfully',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': CONTENT_TYPE_JSON },
      },
    );
  } catch (error) {
    logger.error(
      {
        endpoint: API_ENDPOINTS.engagement,
        method: API_METHODS.POST,
        error: (error as Error).message,
        type: 'engagement_tracking_error',
      },
      `Failed to track engagement: ${(error as Error).message}`,
    );

    response = Response.json(
      { error: `Failed to track engagement: ${(error as Error).message}` },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}
