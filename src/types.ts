import { DialogProps } from '@radix-ui/react-dialog';
import { VariantProps } from 'class-variance-authority';
import { ReactNode } from 'react';
import { Button } from './components/ui/button';

// Export the database types
export type { User, NewUser, Collection, NewCollection, Bid, NewBid } from './db/schema';

export interface DialogModalProps extends DialogProps {
  triggerText: ReactNode;
  triggerVariant?: VariantProps<typeof Button>['variant'];
  dialogTitle?: ReactNode;
  dialogDescription?: ReactNode;
}
