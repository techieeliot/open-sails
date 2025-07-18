import type { DialogProps } from '@radix-ui/react-dialog';
import type { VariantProps } from 'class-variance-authority';
import type { LucideIcon } from 'lucide-react';

import type { Button } from './components/ui/button';
import type {
  User as DbUser,
  NewUser as DbNewUser,
  Collection as DbCollection,
  NewCollection as DbNewCollection,
  Bid as DbBid,
  NewBid as DbNewBid,
} from './db/schema';

export interface DialogModalProps extends DialogProps, React.HTMLAttributes<HTMLDivElement> {
  triggerText: string;
  triggerVariant?: VariantProps<typeof Button>['variant'];
  triggerAriaLabel?: string;
  triggerIcon?: LucideIcon;
  fullWidthTrigger?: boolean;
  dialogTitle?: string;
  dialogDescription?: string;
}

// Extend database types with UI-specific properties
export type Bid = DbBid & {
  onAccept?: (bid: Bid) => void;
  onReject?: (bid: Bid) => void;
};

// Re-export other database types
export type Collection = DbCollection;
export type User = DbUser;
export type NewUser = DbNewUser;
export type NewCollection = DbNewCollection;
export type NewBid = DbNewBid;
