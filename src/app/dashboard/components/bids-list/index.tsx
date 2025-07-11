import { ConfirmationDialog } from '@/components/confirmation-dialog';
import RowItem from '@/components/row-item';
import { Bid } from '@/types';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PriceBidStatus } from './components';
import { useAtomValue } from 'jotai';
import { userSessionAtom } from '@/lib/atoms';
import { cn } from '@/lib/utils';

export interface BidIndexProps {
  isOwner: boolean;
  collectionId: number;
}

export const BidList = ({ isOwner, collectionId }: BidIndexProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [visibleBidsCount, setVisibleBidsCount] = useState(10);
  const { user } = useAtomValue(userSessionAtom);

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
    status: 'accepted' | 'rejected' | 'cancelled',
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

  const cancelBid = async (bidId: number) => {
    await fetch(`/api/bids?bid_id=${bidId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
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
      <Suspense fallback={<div className="text-center text-muted-foreground">Loading bids...</div>}>
        {bids.length === 0 ? (
          <div className="text-center text-muted-foreground">
            No bids found for this collection yet...
          </div>
        ) : (
          bids.slice(0, visibleBidsCount).map((bid, index) => {
            const isBidder = user && bid.userId === user.id;

            return (
              <RowItem key={bid.id} rowTitle={`Bid ${index + 1}`}>
                <div className="flex items-center gap-2">
                  {/* Placeholder for user details */}
                  <span className={cn(isBidder ? 'text-yellow-400' : 'text-muted-foreground')}>
                    User: {bid.userId}
                  </span>
                </div>
                <PriceBidStatus price={bid.price} status={bid.status} />
                <div className="flex items-center gap-2">
                  {/* If collection owner, show an icon/button to accept bid */}
                  {isOwner && bid.status === 'pending' ? (
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
                  ) : !isOwner && bid.status === 'pending' && isBidder ? (
                    <ConfirmationDialog
                      triggerText="Cancel Bid"
                      dialogTitle="Cancel Bid"
                      onConfirm={async () => {
                        try {
                          await cancelBid(bid.id);
                          alert('Bid cancelled successfully');
                          fetchBids();
                        } catch (error) {
                          console.error('Failed to cancel bid:', error);
                          alert('Failed to cancel bid');
                        }
                      }}
                    />
                  ) : null}
                </div>
              </RowItem>
            );
          })
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
