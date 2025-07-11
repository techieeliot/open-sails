import { NextRequest } from 'next/server';
import { logRequest, logResponse } from '@/lib/api-middleware';
import { logger } from '@/lib/logger';
import { alertManager, ALERT_THRESHOLDS, AlertType, AlertSeverity } from '@/lib/alerting';
import { API_METHODS, API_ENDPOINTS, ALERT_ACTIONS } from '@/lib/constants';

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
        endpoint: API_ENDPOINTS.alerts,
        method: API_METHODS.GET,
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
        endpoint: API_ENDPOINTS.alerts,
        method: API_METHODS.GET,
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

    if (action === ALERT_ACTIONS.TEST) {
      // Test alert logic
      const alertType = type as AlertType;
      if (!Object.values(AlertType).includes(alertType)) {
        response = Response.json({ error: 'Invalid alert type for test action' }, { status: 400 });
      }
      await alertManager.sendAlert({
        type: alertType,
        severity: AlertSeverity.HIGH,
        message: `This is a test alert for ${alertType}`,
        value: 99,
        threshold: 90,
        endpoint: endpoint || 'test/endpoint',
        timestamp: new Date().toISOString(),
      });
      response = Response.json({ message: `Test alert for ${type} sent` });
    } else if (action === ALERT_ACTIONS.RESET) {
      alertManager.resetAlerts();
      response = Response.json({ message: 'Alerts have been reset' });
    } else {
      response = Response.json(
        { error: 'Invalid action. Supported actions: test, reset' },
        { status: 400 },
      );
    }

    logger.info(
      {
        endpoint: API_ENDPOINTS.alerts,
        method: POST,
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
        endpoint: API_ENDPOINTS.alerts,
        method: API_METHODS.POST,
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
