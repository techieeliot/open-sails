import { DialogProps } from '@radix-ui/react-dialog';
import { ReactNode } from 'react';

// Export the database types
export type { User, NewUser, Collection, NewCollection, Bid, NewBid } from './db/schema';

export interface DialogModalProps extends DialogProps {
  triggerText: ReactNode;
  dialogTitle: ReactNode;
  description?: ReactNode;
}
