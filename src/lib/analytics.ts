import { track } from '@vercel/analytics';
import { formattedStack } from './logger';

export const trackError = (error: Error, context?: Record<string, unknown>) => {
  track('error', {
    message: error.message,
    stack: formattedStack(error?.stack),
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
