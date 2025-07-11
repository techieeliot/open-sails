import { NextRequest } from 'next/server';
import { MetricsTracker } from '@/lib/logger';
import { logRequest, logResponse } from '@/lib/api-middleware';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);

  try {
    const metrics = MetricsTracker.getInstance();
    const metricsData = metrics.getMetrics();

    const response = new Response(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        metrics: metricsData,
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    logResponse(request, response, startTime);
    return response;
  } catch (error) {
    const response = Response.json(
      { error: `Failed to fetch metrics: ${(error as Error).message}` },
      { status: 500 },
    );

    logResponse(request, response, startTime);
    return response;
  }
}

export async function POST(request: NextRequest) {
  const startTime = logRequest(request);

  try {
    const metrics = MetricsTracker.getInstance();
    metrics.logPeriodicMetrics();

    const response = new Response(
      JSON.stringify({
        message: 'Metrics logged successfully',
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    logResponse(request, response, startTime);
    return response;
  } catch (error) {
    const response = Response.json(
      { error: `Failed to log metrics: ${(error as Error).message}` },
      { status: 500 },
    );

    logResponse(request, response, startTime);
    return response;
  }
}
