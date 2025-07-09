import { ConfirmationDialog } from '@/components/confirmation-dialog';
import RowItem from '@/components/row-item';
import { Bid } from '@/types';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { DynamicInputDialog } from '../dynamic-input-dialog';
import { Button } from '@/components/ui/button';

export interface BidIndexProps {
  isOwner?: boolean;
  collectionId: number;
}

export const BidList = ({ isOwner = true, collectionId }: BidIndexProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [visibleBidsCount, setVisibleBidsCount] = useState(10);

  const fetchBids = useCallback(async () => {
    if (collectionId) {
      const response = await fetch(`/api/bids?collection_id=${collectionId}`);
      const data: Bid[] = await response.json();
      setBids(data);
    }
  }, [collectionId]);

  const resolveBid = async (
    bidId: number,
    collectionId: number,
    status: 'accepted' | 'rejected',
  ) => {
    await fetch(`/api/bids?collection_id=${collectionId}&bid_id=${bidId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        status,
      }),
    });
  };

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  if (!collectionId) {
    return <div className="text-center text-muted-foreground">No collection selected.</div>;
  }

  return (
    <div className="pl-10 w-full">
      {!isOwner && (
        <div className="flex justify-end mb-4">
          <DynamicInputDialog
            triggerText="Place Bid"
            dialogTitle="Place a new bid"
            modalCategory="bid"
            method="POST"
            collectionId={collectionId}
            onSuccess={fetchBids}
          />
        </div>
      )}
      <Suspense fallback={<div className="text-center text-muted-foreground">Loading bids...</div>}>
        {bids.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No bids found for this collection yet...
          </div>
        ) : (
          bids.slice(0, visibleBidsCount).map((bid, index) => (
            <RowItem key={bid.id} rowTitle={`Bid ${index + 1}`}>
              <div className="flex items-center gap-2">
                {/* Placeholder for user details */}
                <span>User: {bid.userId}</span>
              </div>
              {isOwner ? (
                <div className="flex items-center gap-2">
                  {/* Placeholder for bid details */}
                  <span>Price: {bid.price}</span>
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                {/* If collection owner, show an icon/button to accept bid */}
                {bid.status === 'pending' ? (
                  <>
                    <ConfirmationDialog
                      triggerText="Accept"
                      dialogTitle="Accept Bid"
                      description="Are you sure you want to accept this bid?"
                      onConfirm={async () => {
                        try {
                          await resolveBid(bid.id, bid.collectionId, 'accepted');
                          alert('Bid accepted successfully');
                          fetchBids();
                        } catch (error) {
                          console.error('Failed to accept bid:', error);
                          alert('Failed to accept bid');
                        }
                      }}
                    />
                    <ConfirmationDialog
                      triggerText="Reject"
                      dialogTitle="Reject Bid"
                      description="Are you sure you want to reject this bid?"
                      onConfirm={async () => {
                        try {
                          await resolveBid(bid.id, bid.collectionId, 'rejected');
                          alert('Bid rejected successfully');
                          fetchBids();
                        } catch (error) {
                          console.error('Failed to reject bid:', error);
                          alert('Failed to reject bid');
                        }
                      }}
                    />
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Status: {bid.status}</span>
                  </div>
                )}
              </div>
            </RowItem>
          ))
        )}
      </Suspense>
      {visibleBidsCount < bids.length && (
        <div className="flex w-full justify-center mt-4">
          <Button onClick={() => setVisibleBidsCount((prev) => prev + 10)} variant="outline">
            Load More Bids
          </Button>
        </div>
      )}
    </div>
  );
};
