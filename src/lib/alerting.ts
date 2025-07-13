import { DANGER, GLOBAL, POST, UNKNOWN, WARNING } from './constants';
import { logger, MetricsTracker } from './logger';
import { track } from '@vercel/analytics/server';
import { toStartCase } from './utils';

// Alerting configuration
export const ALERT_THRESHOLDS = {
  ERROR_RATE_PERCENT: 5, // 5% error rate triggers alert
  RESPONSE_TIME_MS: 500, // 500ms average response time triggers alert
  SLOW_REQUEST_MS: 1000, // Individual request threshold
  MEMORY_USAGE_PERCENT: 85, // 85% memory usage triggers alert
  CONSECUTIVE_ERRORS: 3, // 3 consecutive errors triggers alert
  TIME_WINDOW_MINUTES: 5, // Time window for calculating rates
};

// Alert types
export enum AlertType {
  ERROR_RATE = 'error_rate',
  RESPONSE_TIME = 'response_time',
  UPTIME = 'uptime',
  MEMORY = 'memory',
  SLOW_REQUEST = 'slow_request',
  CONSECUTIVE_ERRORS = 'consecutive_errors',
}

// Alert severity levels
export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

interface AlertContext {
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  value: number;
  threshold: number;
  endpoint?: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

// Alert manager singleton
export class AlertManager {
  private static instance: AlertManager;
  private recentAlerts: Map<string, number> = new Map();
  private errorHistory: Array<{ timestamp: number; endpoint: string }> = [];
  private consecutiveErrors: Map<string, number> = new Map();

  static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager();
    }
    return AlertManager.instance;
  }

  // Check if we should suppress this alert (rate limiting)
  private shouldSuppressAlert(alertKey: string): boolean {
    const lastAlertTime = this.recentAlerts.get(alertKey);
    const now = Date.now();
    const suppressionWindow = 5 * 60 * 1000; // 5 minutes

    if (lastAlertTime && now - lastAlertTime < suppressionWindow) {
      return true;
    }

    this.recentAlerts.set(alertKey, now);
    return false;
  }

  // Method to reset all alert states
  resetAlerts() {
    this.recentAlerts.clear();
    this.errorHistory = [];
    this.consecutiveErrors.clear();
    logger.info({ type: 'alerts_reset' }, 'All alert states have been reset.');
  }

  // Send alert through multiple channels
  async sendAlert(context: AlertContext) {
    const alertKey = `${context.type}_${context.endpoint || GLOBAL}`;

    if (this.shouldSuppressAlert(alertKey)) {
      logger.debug(
        {
          type: 'alert_suppressed',
          alertType: context.type,
          endpoint: context.endpoint,
        },
        `Alert suppressed: ${context.type} for ${context.endpoint}`,
      );
      return;
    }

    // Log the alert
    logger.error(
      {
        type: 'alert_triggered',
        alertType: context.type,
        severity: context.severity,
        value: context.value,
        threshold: context.threshold,
        endpoint: context.endpoint,
        ...context.metadata,
      },
      `🚨 ALERT: ${context.message}`,
    );

    // Send to Vercel Analytics
    try {
      await track('alert_triggered', {
        alertType: context.type,
        severity: context.severity,
        value: context.value,
        threshold: context.threshold,
        endpoint: context.endpoint || GLOBAL,
        message: context.message,
        timestamp: context.timestamp,
        environment: process.env.NODE_ENV,
        ...context.metadata,
      });
    } catch (error) {
      logger.warn(
        {
          type: 'alert_tracking_failed',
          error: (error as Error).message,
        },
        'Failed to send alert to Vercel Analytics',
      );
    }

    // Send to external alerting services (if configured)
    await this.sendToExternalServices(context);
  }

  // Send to external services (Slack, PagerDuty, etc.)
  private async sendToExternalServices(context: AlertContext) {
    // Slack webhook (if configured)
    if (process.env.SLACK_WEBHOOK_URL) {
      try {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: POST,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚨 ${context.severity.toUpperCase()} Alert: ${context.message}`,
            attachments: [
              {
                color: context.severity === AlertSeverity.CRITICAL ? DANGER : WARNING,
                fields: [
                  { title: 'Type', value: context.type, short: true },
                  {
                    title: 'Endpoint',
                    value: context.endpoint || toStartCase(GLOBAL),
                    short: true,
                  },
                  { title: 'Value', value: context.value.toString(), short: true },
                  { title: 'Threshold', value: context.threshold.toString(), short: true },
                  { title: 'Environment', value: process.env.NODE_ENV || UNKNOWN, short: true },
                  { title: 'Timestamp', value: context.timestamp, short: true },
                ],
              },
            ],
          }),
        });
      } catch (error) {
        logger.warn(
          {
            type: 'slack_alert_failed',
            error: (error as Error).message,
          },
          'Failed to send alert to Slack',
        );
      }
    }

    // PagerDuty integration (if configured)
    if (process.env.PAGERDUTY_INTEGRATION_KEY && context.severity === AlertSeverity.CRITICAL) {
      try {
        await fetch('https://events.pagerduty.com/v2/enqueue', {
          method: POST,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            routing_key: process.env.PAGERDUTY_INTEGRATION_KEY,
            event_action: 'trigger',
            payload: {
              summary: context.message,
              severity: context.severity,
              source: context.endpoint || 'open-sails-api',
              custom_details: {
                type: context.type,
                value: context.value,
                threshold: context.threshold,
                environment: process.env.NODE_ENV,
                ...context.metadata,
              },
            },
          }),
        });
      } catch (error) {
        logger.warn(
          {
            type: 'pagerduty_alert_failed',
            error: (error as Error).message,
          },
          'Failed to send alert to PagerDuty',
        );
      }
    }
  }

  // Check error rate threshold
  async checkErrorRate(endpoint: string) {
    const metrics = MetricsTracker.getInstance();
    const allMetrics = metrics.getMetrics();

    const errorKey = `error_rate:${endpoint}`;
    const responseKey = `response_time:${endpoint}`;

    const errorData = allMetrics[errorKey];
    const responseData = allMetrics[responseKey] as Record<string, unknown>;

    if (!errorData || !responseData || typeof errorData !== 'object' || !('count' in errorData))
      return;

    const totalRequests = (responseData as { count: number }).count;
    const errorCount = (errorData as { count: number }).count;
    const errorRate = (errorCount / totalRequests) * 100;

    if (errorRate > ALERT_THRESHOLDS.ERROR_RATE_PERCENT) {
      await this.sendAlert({
        type: AlertType.ERROR_RATE,
        severity: errorRate > 10 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
        message: `High error rate detected: ${errorRate.toFixed(1)}% (${errorCount}/${totalRequests} requests)`,
        value: errorRate,
        threshold: ALERT_THRESHOLDS.ERROR_RATE_PERCENT,
        endpoint,
        timestamp: new Date().toISOString(),
        metadata: {
          errorCount,
          totalRequests,
        },
      });
    }
  }

  // Check response time threshold
  async checkResponseTime(endpoint: string, duration: number) {
    const metrics = MetricsTracker.getInstance();
    const allMetrics = metrics.getMetrics();

    const responseKey = `response_time:${endpoint}`;
    const responseData = allMetrics[responseKey] as { average: number; max: number; count: number };

    if (!responseData) return;

    const averageResponseTime = responseData.average;

    // Check individual slow request
    if (duration > ALERT_THRESHOLDS.SLOW_REQUEST_MS) {
      await this.sendAlert({
        type: AlertType.SLOW_REQUEST,
        severity: duration > 2000 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
        message: `Slow request detected: ${duration}ms response time`,
        value: duration,
        threshold: ALERT_THRESHOLDS.SLOW_REQUEST_MS,
        endpoint,
        timestamp: new Date().toISOString(),
        metadata: {
          averageResponseTime,
          maxResponseTime: responseData.max,
          requestCount: responseData.count,
        },
      });
    }

    // Check average response time
    if (averageResponseTime > ALERT_THRESHOLDS.RESPONSE_TIME_MS) {
      await this.sendAlert({
        type: AlertType.RESPONSE_TIME,
        severity: averageResponseTime > 1000 ? AlertSeverity.HIGH : AlertSeverity.MEDIUM,
        message: `High average response time: ${averageResponseTime}ms`,
        value: averageResponseTime,
        threshold: ALERT_THRESHOLDS.RESPONSE_TIME_MS,
        endpoint,
        timestamp: new Date().toISOString(),
        metadata: {
          currentResponseTime: duration,
          maxResponseTime: responseData.max,
          requestCount: responseData.count,
        },
      });
    }
  }

  // Check consecutive errors
  async checkConsecutiveErrors(endpoint: string, isError: boolean) {
    if (isError) {
      const current = this.consecutiveErrors.get(endpoint) || 0;
      this.consecutiveErrors.set(endpoint, current + 1);

      if (current + 1 >= ALERT_THRESHOLDS.CONSECUTIVE_ERRORS) {
        await this.sendAlert({
          type: AlertType.CONSECUTIVE_ERRORS,
          severity: AlertSeverity.HIGH,
          message: `${current + 1} consecutive errors detected`,
          value: current + 1,
          threshold: ALERT_THRESHOLDS.CONSECUTIVE_ERRORS,
          endpoint,
          timestamp: new Date().toISOString(),
        });
      }
    } else {
      // Reset consecutive error count on success
      this.consecutiveErrors.set(endpoint, 0);
    }
  }

  // Check memory usage
  async checkMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    const heapUsedMB = memoryUsage.heapUsed / 1024 / 1024;
    const heapTotalMB = memoryUsage.heapTotal / 1024 / 1024;
    const usagePercent = (heapUsedMB / heapTotalMB) * 100;

    if (usagePercent > ALERT_THRESHOLDS.MEMORY_USAGE_PERCENT) {
      await this.sendAlert({
        type: AlertType.MEMORY,
        severity: usagePercent > 95 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
        message: `High memory usage: ${usagePercent.toFixed(1)}% (${heapUsedMB.toFixed(1)}MB/${heapTotalMB.toFixed(1)}MB)`,
        value: usagePercent,
        threshold: ALERT_THRESHOLDS.MEMORY_USAGE_PERCENT,
        timestamp: new Date().toISOString(),
        metadata: {
          heapUsedMB: heapUsedMB.toFixed(1),
          heapTotalMB: heapTotalMB.toFixed(1),
          rss: (memoryUsage.rss / 1024 / 1024).toFixed(1),
        },
      });
    }
  }

  // Clean up old error history
  private cleanupErrorHistory() {
    const now = Date.now();
    const windowMs = ALERT_THRESHOLDS.TIME_WINDOW_MINUTES * 60 * 1000;
    this.errorHistory = this.errorHistory.filter((error) => now - error.timestamp < windowMs);
  }

  // Get current alert status
  getAlertStatus(): Record<string, unknown> {
    const metrics = MetricsTracker.getInstance();
    const allMetrics = metrics.getMetrics();

    const status: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      thresholds: ALERT_THRESHOLDS,
      recentAlerts: Array.from(this.recentAlerts.entries()),
      consecutiveErrors: Array.from(this.consecutiveErrors.entries()),
      metrics: allMetrics,
    };

    return status;
  }
}

// Convenience functions
export const alertManager = AlertManager.getInstance();

export const checkAlerts = async (endpoint: string, duration: number, isError: boolean) => {
  const manager = AlertManager.getInstance();

  // Check response time
  await manager.checkResponseTime(endpoint, duration);

  // Check error rate
  await manager.checkErrorRate(endpoint);

  // Check consecutive errors
  await manager.checkConsecutiveErrors(endpoint, isError);

  // Check memory usage periodically
  if (Math.random() < 0.1) {
    // 10% chance to check memory
    await manager.checkMemoryUsage();
  }
};
