import type { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpDown, Handshake, Ban, Hourglass } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, parseNumeric } from '@/lib/utils';
import type { Bid } from '@/types';

import { BidActionPanel } from './bid-action-panel';
import { BidderInfo } from './bid-into';

export const bidColumnsDefinition: ColumnDef<Bid>[] = [
  {
    accessorKey: 'userId',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Bidder
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return <BidderInfo row={row} />;
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseNumeric(row.getValue('price') as string);
      const status = row.getValue('status') as string;

      return (
        <div className="flex flex-col text-center sm:block">
          <span className="mb-1 hidden font-medium text-muted-foreground text-xs md:inline">
            Amount:
          </span>
          <Badge
            variant={
              status === 'accepted' ? 'secondary' : status === 'rejected' ? 'struckthrough' : 'info'
            }
            className="inline-flex justify-center px-2 py-1 font-semibold text-base"
          >
            {formatPrice(price)}
          </Badge>
        </div>
      );
    },
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('status') as string;

      if (status === 'accepted') {
        return (
          <Badge
            variant="secondary"
            className="inline-flex justify-center px-2 py-1 font-semibold text-base"
          >
            <Handshake className="mr-1 h-4 w-4" /> Accepted
          </Badge>
        );
      } else if (status === 'rejected') {
        return (
          <Badge
            variant="destructive"
            className="inline-flex justify-center px-2 py-1 font-semibold text-base"
          >
            <Ban className="mr-1 h-4 w-4" /> Rejected
          </Badge>
        );
      } else if (status === 'pending') {
        return (
          <Badge
            variant="outline"
            className="inline-flex justify-center px-2 py-1 font-semibold text-base"
          >
            <Hourglass className="mr-1 h-4 w-4" /> Pending
          </Badge>
        );
      }

      return null;
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <div>
          <span className="hidden font-medium text-muted-foreground text-xs md:inline">
            Posted:
          </span>
          <span className="ml-1">{formatDistanceToNow(row.getValue('createdAt'))}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    header: 'Actions',
    size: 250, // Increase the column size for actions
    cell: ({ row }) => {
      return <BidActionPanel row={row} />;
    },
  },
];
