'use client';

import { ColumnDef } from '@tanstack/react-table';
import { formatDistanceToNow } from 'date-fns';
import { useAtomValue } from 'jotai';
import { useAtom } from 'jotai/react';
import {
  AlertCircle,
  Inbox,
  ArrowUpDown,
  User,
  Handshake,
  Ban,
  Hourglass,
  EllipsisVertical,
  CircleX,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  userNamesAtom,
  bidsAtom,
  bidsLoadingAtom,
  bidsErrorAtom,
  userSessionAtom,
  userLoginStatusAtom,
} from '@/lib/atoms';
import { Collection, Bid } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice, parseNumeric } from '@/lib/utils';
import { DataTable } from '@/components/data-table';

import { EditBidDialog } from '../../edit-bid-dialog.client';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import PlaceBidDialog from '@/components/place-bid-dialog';

interface BidsTableProps {
  collection: Collection;
  showPlaceBidButtonAtTop?: boolean;
}

export default function BidsTable({ collection, showPlaceBidButtonAtTop = false }: BidsTableProps) {
  const userNames = useAtomValue(userNamesAtom);
  const [bids, setBids] = useAtom(bidsAtom);
  const [bidsLoading, setBidsLoading] = useAtom(bidsLoadingAtom);
  const [bidsError, setBidsError] = useAtom(bidsErrorAtom);
  const isLoggedIn = useAtomValue(userLoginStatusAtom);
  const userSession = useAtomValue(userSessionAtom);
  const { user } = userSession;
  const router = useRouter();
  const isOwner = isLoggedIn && user?.id === collection.ownerId;

  // Check if the current user has already placed a bid on this collection
  const hasUserPlacedBid =
    isLoggedIn &&
    user &&
    Array.isArray(bids) &&
    bids.some((bid) => bid.userId === user.id && bid.collectionId === collection.id);

  // Only show place bid button if specifically requested AND user hasn't placed a bid yet
  const shouldShowPlaceBidAtTop = showPlaceBidButtonAtTop && !hasUserPlacedBid;

  useEffect(() => {
    if (collection.id) {
      // Fetch bids for the collection
      const fetchBids = async () => {
        setBidsLoading(true);
        setBidsError(null);
        try {
          const response = await fetch(`/api/bids?collection_id=${collection.id}`);
          if (!response.ok) {
            throw new Error('Failed to fetch bids');
          }
          const data = await response.json();
          setBids(data);
        } catch (error) {
          console.error('Error fetching bids:', error);
          setBidsError('Failed to load bids. Please try again later.');
        } finally {
          setBidsLoading(false);
        }
      };
      fetchBids();
    }
  }, [collection.id, setBids, setBidsError, setBidsLoading]);

  const columns: ColumnDef<Bid>[] = [
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
        const bidderName = userNames[userId] || `User ${userId}`;
        return (
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="flex flex-col md:flex-row items-center md:items-start">
              <span className="font-medium text-xs text-muted-foreground md:mr-1 mb-1 md:mb-0 md:hidden inline">
                Bidder:
              </span>
              <span className="font-semibold">{bidderName}</span>
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
            <span className="md:hidden inline font-medium text-xs text-muted-foreground mb-1">
              Amount:
            </span>
            <Badge
              variant={
                status === 'accepted'
                  ? 'secondary'
                  : status === 'rejected'
                    ? 'struckthrough'
                    : 'info'
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
          <div className="flex flex-col sm:block text-center">
            <span className="md:hidden inline font-medium text-xs text-muted-foreground">
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
        const status = row.getValue('status') as string;
        const bidUserId = bid.userId;
        const isUserBidder = isLoggedIn && user?.id === bidUserId;
        const isPending = status === 'pending';

        return (
          <div className="flex justify-end gap-2 min-w-[200px]">
            {/* Collection owner actions - Accept/Reject for pending bids */}
            {isOwner && collection.status === 'open' && isPending && (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  className="text-xs md:w-auto w-full justify-center"
                  onClick={() => {
                    // Logic to accept bid
                    console.log('Accept bid', bid.id);
                  }}
                >
                  <Handshake className="h-4 w-4 mr-1" />
                  <span>Accept</span>
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="text-xs md:w-auto w-full justify-center"
                  onClick={() => {
                    // Logic to reject bid
                    console.log('Reject bid', bid.id);
                  }}
                >
                  <Ban className="h-4 w-4 mr-1" />
                  <span>Reject</span>
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
                  triggerVariant="destructive"
                  onConfirm={async () => {
                    try {
                      const response = await fetch(`/api/bids/${bid.id}`, { method: 'DELETE' });
                      if (!response.ok) throw new Error('Failed to delete bid');
                      // Refetch bids for the collection
                      const updated = await fetch(`/api/bids?collection_id=${collection.id}`);
                      const data = await updated.json();
                      setBids(data);
                      router.push(`/collections/${collection.id}`);
                    } catch (error) {
                      console.error('Error deleting bid:', error);
                      // Optionally show a toast or error message here
                    }
                  }}
                />
              </>
            )}

            {/* View details is always available */}
            <Button variant="outline" size="sm" asChild className="ml-1 min-h-9 md:w-auto w-full">
              <Link
                href={`/bids/${bid.id}`}
                className="inline-flex items-center justify-center gap-1 text-xs hover:underline px-3 whitespace-nowrap"
                aria-label="View bid details"
              >
                <EllipsisVertical className="h-4 w-4" />
                <span className="inline">Details</span>
              </Link>
            </Button>
          </div>
        );
      },
    },
  ];

  if (bidsLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <CardTitle className="mb-4">Bids</CardTitle>
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (bidsError) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <CardTitle className="mb-4">Bids</CardTitle>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{bidsError}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (!Array.isArray(bids) || bids.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <CardTitle className="mb-4">Bids</CardTitle>
          <div className="text-center py-4 text-muted-foreground min-h-[200px] h-auto flex flex-col items-center justify-center">
            <div>
              <Inbox className="mx-auto h-12 w-12" />
              <span className="text-lg">No bids available.</span>
            </div>

            {/* Show Place Bid button for logged-in users who don't own the collection and haven't placed a bid yet */}
            {isLoggedIn && !isOwner && !hasUserPlacedBid && collection.status === 'open' && (
              <div className="mt-6">
                <PlaceBidDialog
                  collectionId={collection.id}
                  onSuccess={() => {
                    // Refresh bids after a new bid is placed
                    if (collection.id) {
                      fetch(`/api/bids?collection_id=${collection.id}`)
                        .then((response) => response.json())
                        .then((data) => setBids(data))
                        .catch((error) => console.error('Error fetching bids:', error));
                    }
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort bids in descending order by price (handle string/number)
  // Ensure bids is an array before sorting
  const bidsArray = Array.isArray(bids) ? bids : [];
  const sortedBids =
    bidsArray.length > 0
      ? [...bidsArray].sort((a, b) => parseNumeric(b.price) - parseNumeric(a.price))
      : [];

  return (
    <Card className="w-full">
      <CardContent className="p-2 sm:p-4 overflow-visible">
        <CardTitle className="mb-4">Bids</CardTitle>

        {/* Show Place Bid button at the top if requested and user hasn't already placed a bid */}
        {shouldShowPlaceBidAtTop && (
          <div className="mb-4 w-full">
            <PlaceBidDialog
              collectionId={collection.id}
              onSuccess={() => {
                // Refresh bids after a new bid is placed
                if (collection.id) {
                  fetch(`/api/bids?collection_id=${collection.id}`)
                    .then((response) => response.json())
                    .then((data) => setBids(data))
                    .catch((error) => console.error('Error fetching bids:', error));
                }
              }}
            />
          </div>
        )}

        <DataTable
          columns={columns}
          data={sortedBids}
          filterColumn="price"
          filterPlaceholder="Filter by price..."
          meta={{
            userNames,
            isOwner,
            collection,
          }}
        />

        {/* Show Place Bid button for logged-in users who don't own the collection and haven't already placed a bid */}
        {isLoggedIn && !isOwner && !hasUserPlacedBid && collection.status === 'open' && (
          <div className="mt-4 flex justify-end">
            <PlaceBidDialog
              collectionId={collection.id}
              onSuccess={() => {
                // Refresh bids after a new bid is placed
                // This will be called when a bid is successfully placed
                if (collection.id) {
                  fetch(`/api/bids?collection_id=${collection.id}`)
                    .then((response) => response.json())
                    .then((data) => setBids(data))
                    .catch((error) => console.error('Error fetching bids:', error));
                }
              }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

BidsTable.displayName = 'BidsTable';
