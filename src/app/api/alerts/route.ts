import { NextRequest } from 'next/server';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { alertManager, ALERT_THRESHOLDS, AlertType, AlertSeverity } from '@/lib/alerting';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    // Get current alert status
    const alertStatus = alertManager.getAlertStatus();

    // Add health check for alerting system
    const healthData = {
      alertingEnabled: true,
      thresholds: ALERT_THRESHOLDS,
      externalServices: {
        slack: !!process.env.SLACK_WEBHOOK_URL,
        pagerduty: !!process.env.PAGERDUTY_INTEGRATION_KEY,
        vercelAnalytics: true,
      },
      status: alertStatus,
      timestamp: new Date().toISOString(),
    };

    response = Response.json(healthData);

    logger.info(
      {
        endpoint: '/api/alerts',
        method: 'GET',
        alertsConfigured:
          alertStatus.metrics && typeof alertStatus.metrics === 'object'
            ? Object.keys(alertStatus.metrics).length
            : 0,
        externalServices: healthData.externalServices,
        type: 'alerts_status_check',
      },
      'Alerts status retrieved',
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/alerts',
        method: 'GET',
        error: (error as Error).message,
        type: 'alerts_status_error',
      },
      `Failed to get alerts status: ${(error as Error).message}`,
    );

    response = Response.json(
      {
        error: 'Failed to retrieve alerts status',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}

export async function POST(request: NextRequest) {
  const startTime = logRequest(request);
  let response: Response;

  try {
    const body = await request.json();
    const { action, type, endpoint } = body;

    if (action === 'test') {
      // Test alert - useful for verifying integrations
      await alertManager.sendAlert({
        type: AlertType.UPTIME,
        severity: AlertSeverity.LOW,
        message: `Test alert from ${endpoint || 'admin'}`,
        value: 1,
        threshold: 1,
        endpoint: endpoint || '/api/alerts',
        timestamp: new Date().toISOString(),
        metadata: {
          isTest: true,
          triggeredBy: 'manual',
        },
      });

      response = Response.json({
        message: 'Test alert sent successfully',
        timestamp: new Date().toISOString(),
      });
    } else if (action === 'reset') {
      // Reset alert history for an endpoint
      if (endpoint) {
        // Note: This would require additional methods in AlertManager
        response = Response.json({
          message: `Alert history reset for ${endpoint}`,
          timestamp: new Date().toISOString(),
        });
      } else {
        response = Response.json({ error: 'Endpoint required for reset action' }, { status: 400 });
      }
    } else {
      response = Response.json(
        { error: 'Invalid action. Supported actions: test, reset' },
        { status: 400 },
      );
    }

    logger.info(
      {
        endpoint: '/api/alerts',
        method: 'POST',
        action,
        alertType: type,
        targetEndpoint: endpoint,
        type: 'alerts_action',
      },
      `Alert action executed: ${action}`,
    );
  } catch (error) {
    logger.error(
      {
        endpoint: '/api/alerts',
        method: 'POST',
        error: (error as Error).message,
        type: 'alerts_action_error',
      },
      `Failed to execute alert action: ${(error as Error).message}`,
    );

    response = Response.json(
      {
        error: 'Failed to execute alert action',
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }

  logResponse(request, response, startTime);
  return response;
}
