import { NextRequest } from 'next/server';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger, PerformanceTracker, MetricsTracker } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    const tracker = new PerformanceTracker('GET /api/health');

    // Get basic health metrics
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
    };

    // Get application metrics
    const metrics = MetricsTracker.getInstance();
    const appMetrics = metrics.getMetrics();

    const fullHealthData = {
      ...healthData,
      metrics: {
        totalRequests: Object.keys(appMetrics).length,
        ...appMetrics,
      },
    };

    tracker.finish();

    response = Response.json(fullHealthData);

    logger.info(
      {
        endpoint: '/api/health',
        method: 'GET',
        uptime: healthData.uptime,
        memoryUsage: healthData.memory.rss,
        type: 'health_check',
      },
      'Health check performed',
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/health',
        method: 'GET',
        error: (error as Error).message,
        type: 'health_check_error',
      },
      `Health check failed: ${(error as Error).message}`,
    );

    response = Response.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: (error as Error).message,
      },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}
