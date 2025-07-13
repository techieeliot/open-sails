import { DialogProps } from '@radix-ui/react-dialog';
import { VariantProps } from 'class-variance-authority';
import { Button } from './components/ui/button';
import { LucideIcon } from 'lucide-react';

// Export the database types
export type { User, NewUser, Collection, NewCollection, Bid, NewBid } from './db/schema';

export interface DialogModalProps extends DialogProps {
  triggerText: string;
  triggerVariant?: VariantProps<typeof Button>['variant'];
  triggerAriaLabel?: string;
  triggerIcon?: LucideIcon;
  dialogTitle?: string;
  dialogDescription?: string;
}
