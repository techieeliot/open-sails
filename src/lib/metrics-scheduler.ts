import { MetricsTracker } from '@/lib/logger';

// Set up periodic metrics logging
if (typeof window === 'undefined') {
  // Server-side only
  const metrics = MetricsTracker.getInstance();

  // Log metrics every 5 minutes
  setInterval(
    () => {
      metrics.logPeriodicMetrics();
    },
    5 * 60 * 1000,
  );

  // Log metrics every hour with more detail
  setInterval(
    () => {
      const metricsData = metrics.getMetrics();
      console.log('Hourly Metrics Report:', JSON.stringify(metricsData, null, 2));
    },
    60 * 60 * 1000,
  );
}

export {};
