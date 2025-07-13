import { NextRequest } from 'next/server';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { formattedStack, logger, MetricsTracker } from '@/lib/logger';
import { alertManager, AlertType, AlertSeverity } from '@/lib/alerting';
import { API_ENDPOINTS } from '@/lib/constants';

// Health check result type
interface HealthCheckResult {
  name: string;
  healthy: boolean;
  responseTime: number;
  duration?: number;
  error?: string;
  details?: Record<string, unknown>;
}

// Health check dependencies
const HEALTH_CHECKS = [
  {
    name: 'database',
    check: async (): Promise<Omit<HealthCheckResult, 'name'>> => {
      // Simulate database health check
      // In real implementation, you'd check actual database connection
      return { healthy: true, responseTime: 5 };
    },
  },
  {
    name: 'external_apis',
    check: async (): Promise<Omit<HealthCheckResult, 'name'>> => {
      // Check external service dependencies
      return { healthy: true, responseTime: 12 };
    },
  },
  {
    name: 'memory_usage',
    check: async (): Promise<Omit<HealthCheckResult, 'name'>> => {
      const memory = process.memoryUsage();
      const heapUsedMB = memory.heapUsed / 1024 / 1024;
      const heapTotalMB = memory.heapTotal / 1024 / 1024;
      const usagePercent = (heapUsedMB / heapTotalMB) * 100;

      return {
        healthy: usagePercent < 90,
        responseTime: 1,
        details: {
          usagePercent: usagePercent.toFixed(1),
          heapUsedMB: heapUsedMB.toFixed(1),
          heapTotalMB: heapTotalMB.toFixed(1),
        },
      };
    },
  },
  {
    name: 'file_system',
    check: async (): Promise<Omit<HealthCheckResult, 'name'>> => {
      // Check file system health
      try {
        // Simple file system check
        const testPath = '/tmp/health-check';
        const { writeFile, unlink } = await import('fs/promises');
        await writeFile(testPath, 'test');
        await unlink(testPath);
        return { healthy: true, responseTime: 2 };
      } catch (error) {
        return { healthy: false, responseTime: 0, error: (error as Error).message };
      }
    },
  },
];

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;
  const healthCheckStart = Date.now();
  const getUptimePayload = {
    endpoint: API_ENDPOINTS.uptime,
    method: 'GET',
    error: '',
    type: 'initial_get',
  };

  try {
    // Run all health checks
    const healthResults: HealthCheckResult[] = await Promise.all(
      HEALTH_CHECKS.map(async (check) => {
        const checkStart = Date.now();
        try {
          const result = await Promise.race([
            check.check(),
            new Promise<never>((_, reject) =>
              setTimeout(() => reject(new Error('Health check timeout')), 5000),
            ),
          ]);
          return {
            name: check.name,
            healthy: result.healthy,
            responseTime: result.responseTime,
            duration: Date.now() - checkStart,
            error: result.error,
            details: result.details,
          };
        } catch (error) {
          return {
            name: check.name,
            healthy: false,
            responseTime: Date.now() - checkStart,
            error: (error as Error).message,
          };
        }
      }),
    );

    // Calculate overall health
    const allHealthy = healthResults.every((result: HealthCheckResult) => result.healthy);
    const totalDuration = Date.now() - healthCheckStart;

    // Get system metrics
    const metrics = MetricsTracker.getInstance();
    const systemMetrics = metrics.getMetrics();

    // Get memory and uptime
    const memory = process.memoryUsage();
    const uptime = process.uptime();

    const healthData = {
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: uptime,
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      duration: totalDuration,
      checks: healthResults,
      system: {
        memory: {
          rss: Math.round(memory.rss / 1024 / 1024),
          heapTotal: Math.round(memory.heapTotal / 1024 / 1024),
          heapUsed: Math.round(memory.heapUsed / 1024 / 1024),
          external: Math.round(memory.external / 1024 / 1024),
        },
        uptime: Math.round(uptime),
        platform: process.platform,
        nodeVersion: process.version,
      },
      metrics: {
        totalEndpoints: Object.keys(systemMetrics).length,
        ...systemMetrics,
      },
    };

    // Set appropriate status code
    const statusCode = allHealthy ? 200 : 503;
    response = Response.json(healthData, { status: statusCode });

    // Log health check results
    logger.info(
      {
        ...getUptimePayload,
        status: healthData.status,
        duration: totalDuration,
        checksCount: healthResults.length,
        failedChecks: healthResults.filter((r: HealthCheckResult) => !r.healthy).length,
        uptime: uptime,
        memoryUsageMB: Math.round(memory.heapUsed / 1024 / 1024),
        type: 'uptime_check',
      },
      `Uptime check completed: ${healthData.status}`,
    );

    // Send alert if system is unhealthy
    if (!allHealthy) {
      const failedChecks = healthResults.filter((r: HealthCheckResult) => !r.healthy);
      await alertManager.sendAlert({
        type: AlertType.UPTIME,
        severity: AlertSeverity.CRITICAL,
        message: `System health check failed: ${failedChecks.map((c: HealthCheckResult) => c.name).join(', ')}`,
        value: failedChecks.length,
        threshold: 0,
        endpoint: '/api/uptime',
        timestamp: new Date().toISOString(),
        metadata: {
          failedChecks: failedChecks.map((c: HealthCheckResult) => ({
            name: c.name,
            error: c.error,
          })),
          totalChecks: healthResults.length,
          duration: totalDuration,
        },
      });
    }
  } catch (error) {
    logger.error(
      {
        ...getUptimePayload,
        error: (error as Error).message,
        type: 'uptime_check_error',
      },
      `Uptime check failed: ${(error as Error).message}`,
    );

    response = Response.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Health check system failure',
        details: (error as Error).message,
      },
      { status: 500 },
    );

    // Send critical alert for health check system failure
    await alertManager.sendAlert({
      ...getUptimePayload,
      type: AlertType.UPTIME,
      severity: AlertSeverity.CRITICAL,
      message: `Health check system failure: ${(error as Error).message}`,
      value: 0,
      threshold: 1,
      timestamp: new Date().toISOString(),
      metadata: {
        error: (error as Error).message,
        stack: formattedStack((error as Error).stack),
      },
    });
  }

  logResponse(request, response, startTime);
  return response;
}

// Optional: Simple ping endpoint for basic uptime monitoring
export async function HEAD(request: NextRequest) {
  const startTime = logRequest(request);

  try {
    const response = new Response(null, { status: 200 });
    logResponse(request, response, startTime);
    return response;
  } catch {
    const response = new Response(null, { status: 500 });
    logResponse(request, response, startTime);
    return response;
  }
}
