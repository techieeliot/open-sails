import type { Row } from '@tanstack/react-table';
import { useAtomValue } from 'jotai';
import { User } from 'lucide-react';

import { userNamesAtom } from '@/lib/atoms';
import type { Bid } from '@/types';

export const BidderInfo = ({ row }: { row: Row<Bid> }) => {
  const userId = row.getValue('userId') as number;
  const userNames = useAtomValue(userNamesAtom);
  const bidderName = userNames[userId] || `User ${userId}`;
  return (
    <div className="flex items-center gap-2">
      <User className="h-5 w-5 text-muted-foreground" />
      <div>
        <span className="hidden font-medium text-muted-foreground text-xs md:inline">Bidder:</span>
        <span className="ml-1 font-semibold">{bidderName}</span>
      </div>
    </div>
  );
};
