import { ConfirmationDialog } from '@/components/confirmation-dialog';
import RowItem from '@/components/row-item';
import { Bid } from '@/types';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { PriceBidStatus } from './components/price-bid-status.client';
import { useAtomValue } from 'jotai';
import { userSessionAtom } from '@/lib/atoms';
import { cn, toTitleCase } from '@/lib/utils';
import { toast } from 'sonner';
import { EditBidDialog } from './components/edit-bid-dialog.client';
import { DELETE, PUT, UNKNOWN } from '@/lib/constants';

export interface BidIndexProps {
  isOwner: boolean;
  collectionId: number;
}

// Helper function to format user IDs consistently
const formatUserId = (userId: string | number | null | undefined): string => {
  if (!userId) return toTitleCase(UNKNOWN);

  if (typeof userId === 'string') {
    // For UUIDs, display only the first part
    return userId.includes('-') ? `${userId.split('-')[0]}...` : userId;
  }

  // For numeric IDs, just return the number as a string
  return String(userId);
};

export const BidList = ({ isOwner, collectionId }: BidIndexProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [visibleBidsCount, setVisibleBidsCount] = useState(10);
  const { user } = useAtomValue(userSessionAtom);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const fetchBids = useCallback(async () => {
    if (collectionId) {
      const response = await fetch(`/api/bids?collection_id=${collectionId}`);
      const data: Bid[] = await response.json();
      setBids(data);

      // Extract unique user IDs from bids
      const uniqueUserIds = Array.from(new Set(data.map((bid) => String(bid.userId))));

      // Fetch user details for these IDs if we have any
      if (uniqueUserIds.length > 0) {
        try {
          const usersResponse = await fetch('/api/users');
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            const userMap: Record<string, string> = {};

            // Create a mapping of user IDs to names
            usersData.forEach((u: { id: string | number; name?: string }) => {
              if (u.id) {
                userMap[String(u.id)] = u.name || 'Anonymous User';
              }
            });

            setUserNames(userMap);
          }
        } catch (error) {
          console.error('Failed to fetch user details:', error);
        }
      }
    }
  }, [collectionId]);

  const resolveBid = async (
    bidId: number,
    collectionId: number,
    status: 'accepted' | 'rejected' | 'cancelled',
  ) => {
    await fetch(`/api/bids?collection_id=${collectionId}&bid_id=${bidId}`, {
      method: PUT,
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
      method: DELETE,
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
                  {/* Display user name if available, otherwise formatted ID */}
                  <span
                    className={cn(
                      'px-2 py-1 rounded-md text-sm',
                      isBidder
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
                    )}
                  >
                    {bid.userId && userNames[String(bid.userId)]
                      ? `${userNames[String(bid.userId)]}`
                      : `User ${formatUserId(bid.userId)}`}
                    {isBidder && ' (You)'}
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
                            toast.success('Bid accepted successfully', {
                              description:
                                'The collection is now closed and other bids have been rejected',
                              duration: 5000,
                            });
                            fetchBids();
                          } catch (error) {
                            console.error('Failed to accept bid:', error);
                            toast.error('Failed to accept bid', {
                              description: 'Please try again later',
                            });
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
                            toast.success('Bid rejected successfully');
                            fetchBids();
                          } catch (error) {
                            console.error('Failed to reject bid:', error);
                            toast.error('Failed to reject bid', {
                              description: 'Please try again later',
                            });
                          }
                        }}
                      />
                    </>
                  ) : !isOwner && bid.status === 'pending' && isBidder ? (
                    <>
                      <EditBidDialog bid={bid} onBidUpdated={fetchBids} />
                      <ConfirmationDialog
                        triggerText="Cancel Bid"
                        dialogTitle="Cancel Bid"
                        onConfirm={async () => {
                          try {
                            await cancelBid(bid.id);
                            toast.success('Bid cancelled successfully');
                            fetchBids();
                          } catch (error) {
                            console.error('Failed to cancel bid:', error);
                            toast.error('Failed to cancel bid', {
                              description: 'Please try again later',
                            });
                          }
                        }}
                      />
                    </>
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
