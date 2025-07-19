import { Row } from '@tanstack/react-table';
import { useAtomValue, useSetAtom } from 'jotai/react';
import { CircleX, Edit, EllipsisVertical, ThumbsDown, ThumbsUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { bidsAtom, collectionsAtom, userLoginStatusAtom, userSessionAtom } from '@/lib/atoms';
import { Bid } from '@/types';

import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { DynamicInputDialog } from '../../dynamic-input-dialog';
import TriggerIconButton from '@/components/trigger-icon-button';

export const BidActionPanel = React.memo(({ row }: { row: Row<Bid> }) => {
  const bid = row.original;
  const setBids = useSetAtom(bidsAtom);
  const status = row.getValue('status') as string;
  const bidUserId = bid.userId;
  const isLoggedIn = useAtomValue(userLoginStatusAtom);
  const userSession = useAtomValue(userSessionAtom);
  const { user } = userSession;
  const isUserBidder = isLoggedIn && user?.id === bidUserId;
  const collections = useAtomValue(collectionsAtom);
  const collection = collections.find((c) => c.id === bid.collectionId);
  const isOwner = isLoggedIn && user?.id === collection?.ownerId;
  const router = useRouter();
  // if any bid is accepted, then reject all the others
  const handleAcceptBid = async () => {
    try {
      const response = await fetch(`/api/bids?bid_id=${bid.id}&collection_id=${bid.collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'accepted',
          price: bid.price,
          userId: bid.userId,
          collectionId: bid.collectionId,
          updatedAt: new Date().toISOString(),
          id: bid.id,
        }),
      });

      if (response.ok) {
        // Only parse JSON if response has content and is not 204
        let updatedBids = null;
        if (response.status !== 204) {
          try {
            updatedBids = await response.json();
          } catch {
            // If JSON parsing fails, ignore and continue
          }
        }

        if (updatedBids) {
          setBids(updatedBids);
        } else {
          // Manually update the local state if no response data
          setBids((prev) =>
            Array.isArray(prev)
              ? prev.map((b) =>
                  b.id === bid.id ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' },
                )
              : [],
          );
        }
        toast.success('Bid accepted successfully');
      } else {
        throw new Error('Failed to accept bid');
      }
    } catch (error) {
      console.error('Failed to accept bid:', error);
      toast.error('Failed to accept bid. Please try again.');
    }
  };

  const handleRejectBid = async () => {
    try {
      const response = await fetch(`/api/bids?bid_id=${bid.id}&collection_id=${bid.collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'rejected',
          price: bid.price,
          userId: bid.userId,
          collectionId: bid.collectionId,
          updatedAt: new Date().toISOString(),
          id: bid.id,
        }),
      });

      if (response.ok) {
        // Only parse JSON if response has content and is not 204
        let updatedBids = null;
        if (response.status !== 204) {
          try {
            updatedBids = await response.json();
          } catch {
            // If JSON parsing fails, ignore and continue
          }
        }

        if (updatedBids) {
          setBids(updatedBids);
        } else {
          // Manually update the local state if no response data
          setBids((prev) =>
            Array.isArray(prev)
              ? prev.map((b) => (b.id === bid.id ? { ...b, status: 'rejected' } : b))
              : [],
          );
        }
        toast.success('Bid rejected successfully');
      } else {
        throw new Error('Failed to reject bid');
      }
    } catch (error) {
      console.error('Failed to reject bid:', error);
      toast.error('Failed to reject bid. Please try again.');
    }
  };

  return (
    <div className="text-center text-base flex flex-col items-center md:flex-row min-w-40 md:justify-end gap-4 md:gap-2">
      {/* Collection owner actions - Accept/Reject for pending bids */}
      {collection?.status === 'open' && bid.status === 'pending' ? (
        <>
          {isOwner && (
            <>
              <ConfirmationDialog
                triggerText="Accept"
                triggerVariant="secondary"
                triggerIcon={ThumbsUp}
                triggerAriaLabel="Accept this bid"
                dialogTitle="Accept Bid"
                dialogDescription={`Are you sure you want to accept this bid for $${bid.price}? This will close the collection and reject all other bids.`}
                onConfirm={handleAcceptBid}
              />
              <ConfirmationDialog
                triggerText="Reject"
                triggerVariant="destructive"
                triggerIcon={ThumbsDown}
                triggerAriaLabel="Reject this bid"
                dialogTitle="Reject Bid"
                dialogDescription={`Are you sure you want to reject this bid for $${bid.price}?`}
                onConfirm={handleRejectBid}
              />
            </>
          )}
          {/* Bidder actions - Edit/Cancel their own pending bids */}
          {isUserBidder && (
            <>
              <DynamicInputDialog
                triggerText="Edit Bid"
                triggerIcon={Edit}
                triggerVariant="outline"
                triggerAriaLabel="open edit bid dialog"
                aria-label="open edit bid dialog"
                dialogTitle="Edit Bid"
                dialogDescription="Update your bid amount"
                method="PUT"
                bidId={bid.id}
                collectionId={bid.collectionId}
                onSuccess={() => {
                  toast.success('Bid updated successfully');
                  router.push(`/collections/${collection.id}`);
                }}
                modalCategory={'bid'}
              />

              <ConfirmationDialog
                triggerText="Cancel"
                triggerIcon={CircleX}
                triggerVariant="destructive"
                aria-label="open confirmation dialog to cancel bid"
                dialogTitle="Cancel Bid"
                dialogDescription="Are you sure you want to cancel this bid? This action cannot be undone."
                onConfirm={async () => {
                  try {
                    const response = await fetch(`/api/bids?bid_id=${bid.id}`, {
                      method: 'DELETE',
                    });

                    if (response.ok) {
                      setBids((prev) =>
                        Array.isArray(prev) ? prev.filter((b) => b.id !== bid.id) : [],
                      );
                      toast.success('Bid cancelled successfully');
                    } else {
                      throw new Error('Failed to cancel bid');
                    }
                  } catch (error) {
                    console.error('Failed to cancel bid:', error);
                    toast.error('Failed to cancel bid. Please try again.');
                  }
                }}
              />
            </>
          )}
        </>
      ) : (
        <Badge
          variant={bid.status === 'accepted' ? 'secondary' : 'destructive'}
          className="flex-1 h-12 md:h-8 md:max-w-xs font-medium text-base transition-all duration-200 active:scale-98 sm:active:scale-100"
        >
          {bid.status === 'accepted' ? (
            <>
              <ThumbsUp className="h-4 w-4 mr-2" />
              Accepted
            </>
          ) : (
            <>
              <ThumbsDown className="h-4 w-4 mr-2" />
              Rejected
            </>
          )}
        </Badge>
      )}

      {/* View details is always available */}
      <Button
        variant="outline"
        size="sm"
        className="flex-1 h-12 md:h-8 md:max-w-xs font-medium text-base transition-all duration-200 active:scale-98 sm:active:scale-100"
        asChild
      >
        <Link href={`/bids/${bid.id}`} aria-label="View bid details">
          <EllipsisVertical className="h-4 w-4 mr-2" />
          <span className="inline">Details</span>
        </Link>
      </Button>
    </div>
  );
});

BidActionPanel.displayName = 'BidActionPanel';
