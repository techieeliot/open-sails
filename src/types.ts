import { DialogProps } from '@radix-ui/react-dialog';

// Export the database types
export type { User, NewUser, Collection, NewCollection, Bid, NewBid } from './db/schema';

// Legacy interfaces for backward compatibility
export interface MinerMetrics {
  hashrate: number; // TH/s
  efficiency: number; // J/TH
  powerDraw: number; // Watts
  dailyRevenue: number; // USD
  lastUpdated: Date;
}

export interface DialogModalProps extends DialogProps {
  triggerText: string;
  dialogTitle: string;
  description?: string;
}
