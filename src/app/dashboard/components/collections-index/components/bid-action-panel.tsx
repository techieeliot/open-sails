import { Row } from '@tanstack/react-table';
import { useAtomValue, useSetAtom } from 'jotai/react';
import { CircleX, EllipsisVertical } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Button } from '@/components/ui/button';
import { bidsAtom, collectionsAtom, userLoginStatusAtom, userSessionAtom } from '@/lib/atoms';
import { Bid } from '@/types';

import { EditBidDialog } from '../../edit-bid-dialog.client';



export const BidActionPanel = ({ row }: { row: Row<Bid> }) => {
  const bid = row.original;
  const setBids = useSetAtom(bidsAtom);
  const status = row.getValue('status') as string;
  const bidUserId = bid.userId;
  const isLoggedIn = useAtomValue(userLoginStatusAtom);
  const userSession = useAtomValue(userSessionAtom);
  const { user } = userSession;
  const isUserBidder = isLoggedIn && user?.id === bidUserId;
  const isPending = status === 'pending';
  const collections = useAtomValue(collectionsAtom);
  const collection = collections.find((c) => c.id === bid.collectionId);
  const isOwner = isLoggedIn && user?.id === collection?.ownerId;
  const router = useRouter();

  return (
    <div className="flex min-w-52 justify-end gap-2">
      {/* Collection owner actions - Accept/Reject for pending bids */}
      {isOwner && collection && collection.status === 'open' && isPending && (
        <>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs"
            onClick={() => {
              // Logic to accept bid
              console.log('Accept bid', bid.id);
            }}
          >
            Accept
          </Button>
          <Button
            variant="destructive"
            size="sm"
            className="text-xs"
            onClick={() => {
              // Logic to reject bid
              console.log('Reject bid', bid.id);
            }}
          >
            Reject
          </Button>
        </>
      )}

      {/* Bidder actions - Edit/Cancel their own pending bids */}
      {isUserBidder && collection && collection.status === 'open' && isPending && (
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
            onConfirm={() => {
              setBids((prev) => (Array.isArray(prev) ? prev.filter((b) => b.id !== bid.id) : []));
              router.push(`/collections/${collection.id}`);
            }}
          />
        </>
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
};
