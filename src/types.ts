import { DialogProps } from '@radix-ui/react-dialog';

export interface Collection {
  id: number;
  name: string;
  descriptions: string;
  price: number;
  stocks: number;
  status: 'open' | 'closed';
  ownerId: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: number;
  price: number;
  collectionId: number;
  userId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

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
