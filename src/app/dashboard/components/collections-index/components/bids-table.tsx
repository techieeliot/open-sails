'use client';

import { useAtomValue } from 'jotai';
import { useAtom } from 'jotai/react';
import { AlertCircle, FileStack, Inbox } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { DataTable } from '@/components/data-table';
import PlaceBidDialog from '@/components/place-bid-dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  userNamesAtom,
  bidsAtom,
  bidsLoadingAtom,
  bidsErrorAtom,
  userSessionAtom,
  userLoginStatusAtom,
} from '@/lib/atoms';
import { parseNumeric } from '@/lib/utils';
import type { Collection, Bid } from '@/types';
import { toast } from 'sonner';
import { bidColumnsDefinition } from './bid-column-definition';

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

  // Early return if collection is null/undefined (e.g., after deletion)
  if (!collection) {
    return (
      <Card className="bg-zinc-900 border-zinc-700 shadow-xl">
        <CardContent className="p-6 text-center">
          <p className="text-zinc-400">Collection not found or has been deleted.</p>
        </CardContent>
      </Card>
    );
  }

  // Accept bid handler
  const handleAcceptBid = async (bid: Bid) => {
    try {
      const response = await fetch(`/api/bids/${bid.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (!response.ok) {
        throw new Error('Failed to accept bid');
      }

      // Refresh bids after accepting
      const updatedBidsResponse = await fetch(`/api/bids?collection_id=${collection.id}`);
      const updatedBids = await updatedBidsResponse.json();
      setBids(updatedBids);

      toast.success('Bid accepted successfully');
    } catch (error) {
      console.error('Error accepting bid:', error);
      toast.error('Failed to accept bid', {
        description: 'Please try again later',
      });
    }
  };

  // Reject bid handler
  const handleRejectBid = async (bid: Bid) => {
    try {
      const response = await fetch(`/api/bids/${bid.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject bid');
      }

      // Refresh bids after rejecting
      const updatedBidsResponse = await fetch(`/api/bids?collection_id=${collection.id}`);
      const updatedBids = await updatedBidsResponse.json();
      setBids(updatedBids);

      toast.success('Bid rejected successfully');
    } catch (error) {
      console.error('Error rejecting bid:', error);
      toast.error('Failed to reject bid', {
        description: 'Please try again later',
      });
    }
  };

  // Add handlers to bids data for owner interactions
  const bidsWithHandlers = bids.map((bid) => ({
    ...bid,
    onAccept:
      isOwner && collection.status === 'open' && bid.status === 'pending'
        ? handleAcceptBid
        : undefined,
    onReject:
      isOwner && collection.status === 'open' && bid.status === 'pending'
        ? handleRejectBid
        : undefined,
  }));

  const columns = bidColumnsDefinition;

  if (bidsLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <CardTitle className="mb-4">Bids</CardTitle>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-[20vw] flex-inline" />
              <Skeleton className="h-8 w-[10vw] flex-inline" />
            </div>

            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
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
          <div className="flex h-auto min-h-[200px] flex-col items-center justify-center py-4 text-center text-muted-foreground">
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
  // Ensure bidsWithHandlers is an array before sorting
  const bidsArray = Array.isArray(bidsWithHandlers) ? bidsWithHandlers : [];
  const sortedBidsWithHandlers =
    bidsArray.length > 0
      ? [...bidsArray].sort((a, b) => parseNumeric(b.price) - parseNumeric(a.price))
      : [];

  return (
    <Card className="w-full shadow-xl border-0 bg-zinc-900 text-white">
      <CardContent className="overflow-visible p-4 sm:p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-blue-500/20 rounded-lg">
            <FileStack
              className="h-5 w-5 text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </div>
          <CardTitle className="text-white text-lg sm:text-xl font-bold">Bids</CardTitle>
        </div>

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
          data={sortedBidsWithHandlers}
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
