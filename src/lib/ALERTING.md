# Alerting System Documentation

## Overview

The alerting system provides comprehensive monitoring and alerting capabilities for the Open Sails application, integrating with Vercel Analytics and external services like Slack and PagerDuty.

## Features

### **Alert Types**

- **Error Rate Alerts**: Triggers when error rate exceeds 5%
- **Response Time Alerts**: Triggers when average response time exceeds 500ms
- **Slow Request Alerts**: Triggers for individual requests over 1000ms
- **Memory Usage Alerts**: Triggers when memory usage exceeds 85%
- **Consecutive Error Alerts**: Triggers after 3 consecutive errors
- **Uptime Monitoring**: Comprehensive health checks with external service integration

### 📊 **Monitoring Endpoints**

#### `/api/health`

Basic health check endpoint with system metrics

```json
{
  "status": "healthy",
  "timestamp": "2025-07-11T05:54:51.251Z",
  "uptime": 123.45,
  "memory": { "rss": 515735552, "heapTotal": 200769536, "heapUsed": 171738736 },
  "metrics": { "totalRequests": 42 }
}
```

#### `/api/uptime`

Comprehensive uptime monitoring with detailed health checks

```json
{
  "status": "healthy",
  "timestamp": "2025-07-11T05:54:51.251Z",
  "uptime": 123.45,
  "duration": 25,
  "checks": [
    { "name": "database", "healthy": true, "responseTime": 5 },
    { "name": "memory_usage", "healthy": true, "responseTime": 1 }
  ],
  "system": {
    "memory": { "rss": 515, "heapTotal": 200, "heapUsed": 171 },
    "uptime": 123,
    "platform": "darwin",
    "nodeVersion": "v18.17.0"
  }
}
```

#### `/api/alerts`

Alert management and status endpoint

```json
{
  "alertingEnabled": true,
  "thresholds": {
    "ERROR_RATE_PERCENT": 5,
    "RESPONSE_TIME_MS": 500,
    "SLOW_REQUEST_MS": 1000
  },
  "externalServices": {
    "slack": true,
    "pagerduty": false,
    "vercelAnalytics": true
  }
}
```

#### `/api/metrics`

Detailed metrics and performance data

```json
{
  "timestamp": "2025-07-11T05:54:51.251Z",
  "metrics": {
    "response_time:/api/collections": {
      "average": 245,
      "max": 500,
      "min": 100,
      "count": 15
    },
    "error_rate:/api/collections": {
      "count": 2
    }
  }
}
```

## Configuration

### Environment Variables

```bash
# Alert Thresholds
ALERT_ERROR_RATE_THRESHOLD=5          # 5% error rate
ALERT_RESPONSE_TIME_THRESHOLD=500     # 500ms average response time
ALERT_SLOW_REQUEST_THRESHOLD=1000     # 1000ms individual request
ALERT_MEMORY_USAGE_THRESHOLD=85       # 85% memory usage
ALERT_CONSECUTIVE_ERRORS_THRESHOLD=3  # 3 consecutive errors

# External Services
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
PAGERDUTY_INTEGRATION_KEY=your-pagerduty-integration-key

# Monitoring
UPTIME_MONITORING_ENABLED=true
HEALTH_CHECK_TIMEOUT=5000
```

### Alert Severity Levels

| Level        | Description                 | Action                                   |
| ------------ | --------------------------- | ---------------------------------------- |
| **LOW**      | Minor issues, informational | Log only                                 |
| **MEDIUM**   | Performance degradation     | Slack notification                       |
| **HIGH**     | Service impacting issues    | Slack notification + escalation          |
| **CRITICAL** | System failure              | Slack + PagerDuty + immediate escalation |

## External Service Integration

### Slack Integration

1. Create a Slack app and incoming webhook
2. Set `SLACK_WEBHOOK_URL` environment variable
3. Alerts will be sent to your configured Slack channel

**Example Slack Alert:**

```
🚨 HIGH Alert: High error rate detected: 7.5% (15/200 requests)
Type: error_rate
Endpoint: /api/collections
Value: 7.5
Threshold: 5.0
Environment: production
```

### PagerDuty Integration

1. Create a PagerDuty service and integration
2. Set `PAGERDUTY_INTEGRATION_KEY` environment variable
3. Critical alerts will trigger PagerDuty incidents

### Vercel Analytics Integration

- Automatically enabled when `@vercel/analytics` is installed
- All alerts are tracked as custom events
- View analytics in your Vercel dashboard

## Uptime Monitoring with External Services

### Pingdom Setup

1. Create a Pingdom account
2. Add uptime check for: `https://your-domain.com/api/uptime`
3. Configure alerting thresholds:
   - Check interval: 1 minute
   - Error threshold: 30 seconds
   - Alert after: 2 consecutive failures

### StatusCake Setup

1. Create a StatusCake account
2. Add uptime test for: `https://your-domain.com/api/uptime`
3. Configure test settings:
   - Test type: HTTP
   - Check rate: 1 minute
   - Timeout: 30 seconds
   - Confirmation: 3 times

### Custom Health Checks

The system includes several built-in health checks:

- **Database**: Connection and query performance
- **External APIs**: Third-party service availability
- **Memory Usage**: System memory consumption
- **File System**: Read/write operations

## Usage Examples

### Test Alerts

```bash
# Test alert system
curl -X POST https://your-domain.com/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"action": "test", "endpoint": "/api/test"}'
```

### Monitor Metrics

```bash
# Get current metrics
curl https://your-domain.com/api/metrics

# Check uptime status
curl https://your-domain.com/api/uptime

# Get alert configuration
curl https://your-domain.com/api/alerts
```

### Development Testing

```bash
# Run with debug logging
LOG_LEVEL=debug npm run dev

# Test with curl
curl -X GET http://localhost:3000/api/health
curl -X GET http://localhost:3000/api/uptime
curl -X GET http://localhost:3000/api/alerts
```

## Alert Rate Limiting

- Alerts are rate-limited to prevent spam
- Same alert type for the same endpoint is suppressed for 5 minutes
- Critical alerts bypass some rate limiting

## Monitoring Dashboard

Access your monitoring data:

1. **Vercel Analytics**: View in Vercel dashboard
2. **Logs**: Use `npm run logs:dev` or `npm run logs:prod`
3. **Metrics**: Query `/api/metrics` endpoint
4. **Health**: Monitor `/api/uptime` endpoint

## Best Practices

1. **Set up external monitoring** (Pingdom/StatusCake) for `/api/uptime`
2. **Configure Slack alerts** for immediate notifications
3. **Use PagerDuty** for critical production alerts
4. **Monitor metrics regularly** via `/api/metrics`
5. **Test alert system** before deploying to production
6. **Review alert thresholds** based on your application needs

## Troubleshooting

### Common Issues

1. **Alerts not sending**: Check environment variables and external service configuration
2. **High memory alerts**: Monitor system resources and optimize application
3. **Slow response alerts**: Investigate database queries and external API calls
4. **Uptime check failures**: Review health check implementations

### Debug Commands

```bash
# Check alert configuration
curl http://localhost:3000/api/alerts

# View current metrics
curl http://localhost:3000/api/metrics

# Test uptime endpoint
curl http://localhost:3000/api/uptime

# Send test alert
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"action": "test"}'
```

## Performance Impact

The alerting system is designed to be lightweight:

- Minimal overhead on API requests
- Asynchronous alert checking
- Efficient memory usage for metrics storage
- Rate limiting prevents excessive external calls

## Security Considerations

- Environment variables contain sensitive keys
- Alert endpoints should be secured in production
- Consider IP whitelisting for monitoring endpoints
- Log sensitive data carefully to avoid exposure
