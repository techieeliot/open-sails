import { NextRequest, NextResponse } from 'next/server';
import { logger, PerformanceTracker, MetricsTracker, logApiCall } from './logger';

// Type for API handler
export type ApiHandler = (req: NextRequest, context?: any) => Promise<Response>;

// Enhanced API wrapper with logging
export function withLogging(handler: ApiHandler) {
  return async (req: NextRequest, context?: any): Promise<Response> => {
    const tracker = new PerformanceTracker(`${req.method} ${req.nextUrl.pathname}`);
    const metrics = MetricsTracker.getInstance();
    const startTime = Date.now();

    let response: Response;
    let statusCode = 200;
    let error: Error | null = null;

    try {
      // Log incoming request
      logger.info(
        {
          method: req.method,
          url: req.nextUrl.pathname,
          userAgent: req.headers.get('user-agent'),
          ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
          type: 'request_start',
        },
        `${req.method} ${req.nextUrl.pathname} - Request started`,
      );

      // Execute the handler
      response = await handler(req, context);
      statusCode = response.status;
    } catch (err) {
      error = err as Error;
      statusCode = 500;

      // Log error
      logger.error(
        {
          method: req.method,
          url: req.nextUrl.pathname,
          error: error.message,
          stack: error.stack,
          type: 'request_error',
        },
        `${req.method} ${req.nextUrl.pathname} - Request failed: ${error.message}`,
      );

      // Track error metrics
      metrics.trackError(req.nextUrl.pathname, error);

      // Return error response
      response = NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    // Calculate response time
    const duration = tracker.finish({
      statusCode,
      method: req.method,
      url: req.nextUrl.pathname,
    });

    // Track metrics
    metrics.trackResponseTime(req.nextUrl.pathname, duration);

    // Log API call
    logApiCall(req.method, req.nextUrl.pathname, statusCode, duration);

    return response;
  };
}

// Request/Response logging middleware
export function logRequest(req: NextRequest) {
  const startTime = Date.now();

  logger.info(
    {
      method: req.method,
      url: req.nextUrl.pathname,
      searchParams: Object.fromEntries(req.nextUrl.searchParams),
      headers: {
        'user-agent': req.headers.get('user-agent'),
        'content-type': req.headers.get('content-type'),
        authorization: req.headers.get('authorization') ? '***' : undefined,
      },
      ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip'),
      type: 'incoming_request',
    },
    `Incoming ${req.method} request to ${req.nextUrl.pathname}`,
  );

  return startTime;
}

export function logResponse(req: NextRequest, response: Response, startTime: number) {
  const duration = Date.now() - startTime;
  const level = response.status >= 500 ? 'error' : response.status >= 400 ? 'warn' : 'info';

  logger[level](
    {
      method: req.method,
      url: req.nextUrl.pathname,
      statusCode: response.status,
      duration,
      type: 'response_sent',
    },
    `${req.method} ${req.nextUrl.pathname} - ${response.status} (${duration}ms)`,
  );
}

// Error handling wrapper
export function handleApiError(error: Error, req: NextRequest): Response {
  logger.error(
    {
      method: req.method,
      url: req.nextUrl.pathname,
      error: error.message,
      stack: error.stack,
      type: 'api_error',
    },
    `API Error: ${req.method} ${req.nextUrl.pathname} - ${error.message}`,
  );

  // Track error metrics
  const metrics = MetricsTracker.getInstance();
  metrics.trackError(req.nextUrl.pathname, error);

  return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
}

// Database query logging wrapper
export function withDatabaseLogging<T>(operation: string, query: () => Promise<T>): Promise<T> {
  return new Promise(async (resolve, reject) => {
    const tracker = new PerformanceTracker(`DB: ${operation}`);

    try {
      const result = await query();
      tracker.finish();
      resolve(result);
    } catch (error) {
      logger.error(
        {
          operation,
          error: (error as Error).message,
          type: 'database_error',
        },
        `Database operation failed: ${operation}`,
      );
      reject(error);
    }
  });
}
