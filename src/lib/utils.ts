import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function fetchMiningMetrics() {
  // Mock mining metrics data
  return {
    hashRate: Math.random() * 100000, // H/s
    activeMachines: Math.floor(Math.random() * 100),
    totalPower: Math.random() * 5000, // watts
    dailyEarnings: Math.random() * 0.01, // BTC
    uptime: 99.9,
    temperature: 65 + Math.random() * 10, // Celsius
  };
}

export function formatHashRate(hashRate: number): string {
  if (hashRate >= 1e12) {
    return `${(hashRate / 1e12).toFixed(2)} TH/s`;
  } else if (hashRate >= 1e9) {
    return `${(hashRate / 1e9).toFixed(2)} GH/s`;
  } else if (hashRate >= 1e6) {
    return `${(hashRate / 1e6).toFixed(2)} MH/s`;
  } else {
    return `${hashRate.toFixed(2)} H/s`;
  }
}

export function formatPower(power: number): string {
  if (power >= 1e6) {
    return `${(power / 1e6).toFixed(2)} MW`;
  } else if (power >= 1e3) {
    return `${(power / 1e3).toFixed(2)} kW`;
  } else {
    return `${power.toFixed(2)} W`;
  }
}
