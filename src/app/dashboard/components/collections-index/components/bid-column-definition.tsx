'use client';

import { ColumnDef } from '@tanstack/react-table';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { useSetAtom, useAtomValue } from 'jotai/react';
import {
  CircleX,
  EllipsisVertical,
  ArrowUpDown,
  User,
  Handshake,
  Ban,
  Hourglass,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  collectionsAtom,
  userNamesAtom,
  bidsAtom,
  userSessionAtom,
  userLoginStatusAtom,
} from '@/lib/atoms';
import { Bid } from '@/types';

import { formatPrice, parseNumeric } from '@/lib/utils';

import { EditBidDialog } from '../../edit-bid-dialog.client';
import { collections } from '@/db';

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
      const userId = row.getValue('userId') as number;
      const userNames = useAtomValue(userNamesAtom);
      const bidderName = userNames[userId] || `User ${userId}`;
      return (
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <div>
            <span className="hidden md:inline font-medium text-xs text-muted-foreground">
              Bidder:
            </span>
            <span className="font-semibold ml-1">{bidderName}</span>
          </div>
        </div>
      );
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
        <div className="flex flex-col sm:block text-center">
          <span className="hidden md:inline font-medium text-xs text-muted-foreground mb-1">
            Amount:
          </span>
          <Badge
            variant={
              status === 'accepted' ? 'secondary' : status === 'rejected' ? 'struckthrough' : 'info'
            }
            className="px-2 py-1 text-base font-semibold inline-flex justify-center"
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
            className="px-2 py-1 text-base font-semibold inline-flex justify-center"
          >
            <Handshake className="h-4 w-4 mr-1" /> Accepted
          </Badge>
        );
      } else if (status === 'rejected') {
        return (
          <Badge
            variant="destructive"
            className="px-2 py-1 text-base font-semibold inline-flex justify-center"
          >
            <Ban className="h-4 w-4 mr-1" /> Rejected
          </Badge>
        );
      } else if (status === 'pending') {
        return (
          <Badge
            variant="outline"
            className="px-2 py-1 text-base font-semibold inline-flex justify-center"
          >
            <Hourglass className="h-4 w-4 mr-1" /> Pending
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
          <span className="hidden md:inline font-medium text-xs text-muted-foreground">
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
      const bid = row.original;
      const setBids = useSetAtom(bidsAtom);
      const status = row.getValue('status') as string;
      const router = useRouter();
      const bidUserId = bid.userId;
      const isLoggedIn = useAtomValue(userLoginStatusAtom);
      const userSession = useAtomValue(userSessionAtom);
      const { user } = userSession;
      const isUserBidder = isLoggedIn && user?.id === bidUserId;
      const collections = useAtomValue(collectionsAtom);
      const collection = collections.find((c) => c.id === bid.collectionId);
      const isOwner = isLoggedIn && user?.id === collection?.ownerId;
      const isPending = status === 'pending';
      // Defensive: only render if collection exists
      if (!collection) return null;

      return (
        <div className="flex justify-end gap-2 min-w-52">
          {/* Collection owner actions - Accept/Reject for pending bids */}
          {isOwner && collection.status === 'open' && isPending && (
            <>
              <Button
                variant="secondary"
                size="sm"
                className="text-xs"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/bids/${bid.id}/accept`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                    });
                    if (!response.ok) throw new Error('Failed to accept bid');
                    setBids((prev: Bid[]) =>
                      Array.isArray(prev)
                        ? prev.map((b) => (b.id === bid.id ? { ...b, status: 'accepted' } : b))
                        : [],
                    );
                    toast.success('Bid accepted');
                  } catch (error) {
                    toast.error('Failed to accept bid');
                  }
                }}
              >
                Accept
              </Button>
              <Button
                variant="destructive"
                size="sm"
                className="text-xs"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/bids/${bid.id}/reject`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                    });
                    if (!response.ok) throw new Error('Failed to reject bid');
                    setBids((prev: Bid[]) =>
                      Array.isArray(prev)
                        ? prev.map((b) => (b.id === bid.id ? { ...b, status: 'rejected' } : b))
                        : [],
                    );
                    toast.success('Bid rejected');
                  } catch (error) {
                    toast.error('Failed to reject bid');
                  }
                }}
              >
                Reject
              </Button>
            </>
          )}

          {/* Bidder actions - Edit/Cancel their own pending bids */}
          {isUserBidder && collection.status === 'open' && isPending && (
            <>
              <EditBidDialog
                bid={bid}
                onBidUpdated={function (): void {
                  router.push(`/bids/${bid.id}`);
                }}
              />

              <ConfirmationDialog
                triggerText="Cancel"
                triggerIcon={CircleX}
                dialogTitle="Cancel Bid"
                dialogDescription="Are you sure you want to cancel this bid? This action cannot be undone."
                onConfirm={async () => {
                  try {
                    const response = await fetch(`/api/bids/${bid.id}`, {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                    });
                    if (!response.ok) throw new Error('Failed to cancel bid');
                    setBids((prev: Bid[]) =>
                      Array.isArray(prev) ? prev.filter((b) => b.id !== bid.id) : [],
                    );
                    toast.success('Bid cancelled');
                    router.push(`/collections/${collection.id}`);
                  } catch (error) {
                    toast.error('Failed to cancel bid');
                  }
                }}
              />
            </>
          )}

          {/* View details is always available */}
          <Button variant="outline" size="sm" asChild className="ml-1 min-h-9">
            <Link
              href={`/bids/${bid.id}`}
              className="inline-flex items-center justify-center gap-1 text-xs hover:underline px-3 whitespace-nowrap"
              aria-label="View bid details"
            >
              <span className="flex items-center gap-1">
                <EllipsisVertical className="h-4 w-4" />
                <span className="inline">Details</span>
              </span>
            </Link>
          </Button>
        </div>
      );
    },
  },
];
