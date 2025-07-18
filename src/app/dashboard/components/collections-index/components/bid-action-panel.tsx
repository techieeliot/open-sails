import { Row } from '@tanstack/react-table';
import { useAtomValue, useSetAtom } from 'jotai/react';
import { CircleX, EllipsisVertical } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { bidsAtom, collectionsAtom, userLoginStatusAtom, userSessionAtom } from '@/lib/atoms';
import { Bid } from '@/types';

import { EditBidDialog } from '../../edit-bid-dialog.client';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

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
  const handleAcceptBid = () => {
    if (bid.id) {
      setBids((prev) =>
        Array.isArray(prev)
          ? prev.map((b) =>
              b.id === bid.id ? { ...b, status: 'accepted' } : { ...b, status: 'rejected' },
            )
          : [],
      );
      // set collection status to closed
      if (collection) {
        fetch(`/api/collections/${collection.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'closed' }),
        })
          .then((res) => {
            if (!res.ok) {
              throw new Error('Failed to update collection status');
            }
            return res.json();
          })
          .then(() => {
            toast.success('Bid accepted successfully');
          })
          .catch((error) => {
            toast.error(error.message);
          });
      }
      router.refresh();
    }
  };

  const handleRejectBid = () => {
    if (bid.id) {
      setBids((prev) =>
        Array.isArray(prev)
          ? prev.map((b) => (b.id === bid.id ? { ...b, status: 'rejected' } : b))
          : [],
      );
      toast.error('Bid rejected successfully');
      router.refresh();
    }
  };

  return (
    <div className="flex min-w-52 justify-end gap-2">
      {/* Collection owner actions - Accept/Reject for pending bids */}
      {collection?.status === 'open' && isOwner && bid.status === 'pending' && (
        <>
          <Button variant="secondary" size="sm" className="text-xs" onClick={handleAcceptBid}>
            {bid.status === 'pending' ? 'Pending' : 'Accepted'}
          </Button>
          <Button variant="destructive" size="sm" className="text-xs" onClick={handleRejectBid}>
            Reject
          </Button>
        </>
      )}
      {/* Bidder actions - Edit/Cancel their own pending bids */}
      {isUserBidder
        ? collection &&
          collection.status === 'open' &&
          bid.status === 'pending' && (
            <>
              <EditBidDialog
                bid={bid}
                onBidUpdated={(): void => {
                  router.push(`/bids/${bid.id}`);
                }}
              />

              <ConfirmationDialog
                triggerText="Cancel"
                triggerIcon={CircleX}
                triggerVariant="destructive"
                aria-label="open confirmation dialog to cancel bid"
                dialogTitle="Cancel Bid"
                dialogDescription="Are you sure you want to cancel this bid? This action cannot be undone."
                onConfirm={() => {
                  setBids((prev) =>
                    Array.isArray(prev) ? prev.filter((b) => b.id !== bid.id) : [],
                  );
                  router.push(`/collections/${collection.id}`);
                }}
              />
            </>
          )
        : collection?.status === 'closed' && (
            <Badge variant={bid.status === 'accepted' ? 'secondary' : 'destructive'}>
              {bid.status === 'accepted' ? 'Accepted' : 'Rejected'}
            </Badge>
          )}
      {/* View details is always available */}
      <Button variant="outline" size="sm" asChild className="ml-1 min-h-9">
        <Link
          href={`/bids/${bid.id}`}
          className="inline-flex items-center justify-center gap-1 whitespace-nowrap px-3 text-xs hover:underline"
          aria-label="View bid details"
        >
          <EllipsisVertical className="h-4 w-4" />
          <span className="inline">Details</span>
        </Link>
      </Button>
    </div>
  );
});

BidActionPanel.displayName = 'BidActionPanel';
