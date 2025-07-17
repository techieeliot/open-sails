import { NextRequest } from 'next/server';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { API_ENDPOINTS, API_METHODS } from '@/lib/constants';
import { logger, PerformanceTracker, MetricsTracker } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  const getHealthPayload = {
    endpoint: API_ENDPOINTS.health,
    method: API_METHODS.GET,
    error: '',
    type: 'initial_get',
  };
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
        ...getHealthPayload,
        uptime: healthData.uptime,
        memoryUsage: healthData.memory.rss,
        type: 'health_check',
      },
      'Health check performed',
    );
  } catch (error) {
    logger.error(
      { ...getHealthPayload, error: (error as Error).message, type: 'health_check_error' },
      `Health check failed: ${(error as Error).message}`,
    );
    response = Response.json(
      {
        error: `Health check failed: ${(error as Error).message}`,
      },
      { status: 500 },
    );
  }
  logResponse(request, response, startTime);
  return response;
}
