// Simple console-based logger for all environments to avoid Next.js worker issues
const createSimpleLogger = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return {
    info: (obj: Record<string, unknown>, msg?: string) => {
      if (isDevelopment) {
        console.log(`[INFO] ${msg || ''}`, obj);
      } else {
        console.log(
          JSON.stringify({
            level: 'INFO',
            message: msg,
            data: obj,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    },
    warn: (obj: Record<string, unknown>, msg?: string) => {
      if (isDevelopment) {
        console.warn(`[WARN] ${msg || ''}`, obj);
      } else {
        console.warn(
          JSON.stringify({
            level: 'WARN',
            message: msg,
            data: obj,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    },
    error: (obj: Record<string, unknown>, msg?: string) => {
      if (isDevelopment) {
        console.error(`[ERROR] ${msg || ''}`, obj);
      } else {
        console.error(
          JSON.stringify({
            level: 'ERROR',
            message: msg,
            data: obj,
            timestamp: new Date().toISOString(),
          }),
        );
      }
    },
    debug: (obj: Record<string, unknown>, msg?: string) => {
      if (isDevelopment) {
        console.debug(`[DEBUG] ${msg || ''}`, obj);
      } else {
        // Only log debug in production if LOG_LEVEL is debug
        if (process.env.LOG_LEVEL === 'debug') {
          console.log(
            JSON.stringify({
              level: 'DEBUG',
              message: msg,
              data: obj,
              timestamp: new Date().toISOString(),
            }),
          );
        }
      }
    },
  };
};

// Create logger instance
export const logger = createSimpleLogger();

// Log levels enum for consistency
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

// Performance tracking utility
export class PerformanceTracker {
  private startTime: number;
  private operation: string;

  constructor(operation: string) {
    this.operation = operation;
    this.startTime = Date.now();
  }

  finish(additionalData?: Record<string, unknown>) {
    const duration = Date.now() - this.startTime;

    logger.info(
      {
        operation: this.operation,
        duration,
        ...additionalData,
      },
      `${this.operation} completed in ${duration}ms`,
    );

    return duration;
  }
}

// Metrics tracking
export class MetricsTracker {
  private static instance: MetricsTracker;
  private metrics: Map<string, number[]> = new Map();

  static getInstance(): MetricsTracker {
    if (!MetricsTracker.instance) {
      MetricsTracker.instance = new MetricsTracker();
    }
    return MetricsTracker.instance;
  }

  trackResponseTime(endpoint: string, duration: number) {
    const key = `response_time:${endpoint}`;
    const times = this.metrics.get(key) || [];
    times.push(duration);
    this.metrics.set(key, times);

    // Log if response time is concerning
    if (duration > 1000) {
      logger.warn(
        {
          endpoint,
          duration,
          type: 'slow_response',
        },
        `Slow response detected: ${endpoint} took ${duration}ms`,
      );
    }
  }

  trackError(endpoint: string, error: Error) {
    const key = `error_rate:${endpoint}`;
    const errors = this.metrics.get(key) || [];
    errors.push(1);
    this.metrics.set(key, errors);

    logger.error(
      {
        endpoint,
        error: error.message,
        stack: formattedStack(error.stack),
        type: 'api_error',
      },
      `API Error: ${endpoint} - ${error.message}`,
    );
  }

  trackUserEngagement(action: string, userId?: string) {
    const key = `user_engagement:${action}`;
    const engagements = this.metrics.get(key) || [];
    engagements.push(1);
    this.metrics.set(key, engagements);

    logger.info(
      {
        action,
        userId,
        type: 'user_engagement',
      },
      `User engagement: ${action}`,
    );
  }

  getMetrics(): Record<string, unknown> {
    const summary: Record<string, unknown> = {};

    this.metrics.forEach((values, key) => {
      const [type] = key.split(':');

      if (type === 'response_time') {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        const max = Math.max(...values);
        const min = Math.min(...values);

        summary[key] = {
          average: Math.round(avg),
          max,
          min,
          count: values.length,
        };
      } else {
        summary[key] = {
          count: values.length,
        };
      }
    });

    return summary;
  }

  logPeriodicMetrics() {
    const metrics = this.getMetrics();
    logger.info(
      {
        metrics,
        type: 'periodic_metrics',
      },
      'Periodic metrics report',
    );
  }
}

// Utility functions
export const logApiCall = (
  method: string,
  endpoint: string,
  statusCode: number,
  duration: number,
  userId?: string,
) => {
  const level =
    statusCode >= 500 ? LogLevel.ERROR : statusCode >= 400 ? LogLevel.WARN : LogLevel.INFO;

  logger[level](
    {
      method,
      endpoint,
      statusCode,
      duration,
      userId,
      type: 'api_call',
    },
    `${method} ${endpoint} - ${statusCode} (${duration}ms)`,
  );
};

export const logUserAction = (
  action: string,
  userId: string,
  metadata?: Record<string, unknown>,
) => {
  logger.info(
    {
      action,
      userId,
      ...metadata,
      type: 'user_action',
    },
    `User action: ${action}`,
  );
};

export const logError = (error: Error, context?: Record<string, unknown>) => {
  logger.error(
    {
      error: error.message,
      stack: formattedStack(error.stack),
      ...context,
      type: 'application_error',
    },
    `Application error: ${error.message}`,
  );
};

export const logDatabaseQuery = (query: string, duration: number, rowCount?: number) => {
  logger.debug(
    {
      query,
      duration,
      rowCount,
      type: 'database_query',
    },
    `Database query completed in ${duration}ms`,
  );
};

export const formattedStack = (stack: Error['stack']) => {
  return stack
    ? `First 5 lines of stack trace...\n${stack
        .split('\n')
        .slice(0, 6) // Error message + top 5 stack lines
        .map((line) => line.trim())
        .join('\n')}`
    : 'No stack trace available';
};

export default logger;
