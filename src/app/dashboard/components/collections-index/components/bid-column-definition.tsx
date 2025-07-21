import type { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpDown, Handshake, Ban, Hourglass, ThumbsUp, ThumbsDown } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, parseNumeric, toStartCase } from '@/lib/utils';
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
          size="sm"
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
          size="sm"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          <span className="text-xs text-muted-foreground">Amount</span>
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const price = parseNumeric(row.getValue('price') as string);
      const status = row.getValue('status') as string;

      return (
        <Badge
          variant={
            status === 'accepted' ? 'secondary' : status === 'rejected' ? 'struckthrough' : 'info'
          }
          className="inline-flex justify-center px-2 py-1 font-semibold text-base"
        >
          {formatPrice(price)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <Button
        variant="ghost"
        size="sm"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
      >
        Status
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const status = row.getValue('status') as string;
      const isBidAccepted = status === 'accepted';
      return (
        <Badge
          variant={isBidAccepted ? 'secondary' : status === 'rejected' ? 'struckthrough' : 'info'}
          className="inline-flex justify-center px-2 py-1 font-semibold text-base"
        >
          {isBidAccepted ? (
            <ThumbsUp className="mr-1 h-4 w-4" />
          ) : (
            <ThumbsDown className="mr-1 h-4 w-4" />
          )}
          {toStartCase(status)}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'createdAt',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          size="sm"
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
          <span className="md:hidden font-medium text-muted-foreground text-xs inline">
            Posted:
          </span>
          <span className="ml-1">
            {formatDistanceToNow(row.getValue('createdAt'), { addSuffix: true })}
          </span>
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
