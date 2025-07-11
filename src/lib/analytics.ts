import { track } from '@vercel/analytics';

export const trackError = (error: Error, context?: Record<string, unknown>) => {
  track('error', {
    message: error.message,
    stack: error.stack?.substring(0, 500) ?? '', // Limit stack trace length
    url: window.location.href,
    ...context,
  });
};

export const trackPerformance = (name: string, duration: number) => {
  track('performance', {
    name,
    duration,
    url: window.location.href,
  });
};
