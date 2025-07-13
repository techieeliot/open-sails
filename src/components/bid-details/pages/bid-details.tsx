import { ConfirmationDialog } from '@/components/confirmation-dialog';
import GoBackButton from '@/components/go-back-button.tsx';
import PageWrapper from '@/components/page-wrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DELETE } from '@/lib/constants';
import { Bid, Collection } from '@/types';
import router from 'next/router';
import { toast } from 'sonner';

export default function BidDetailsPage({
  collection,
  bid,
  isBidder,
}: {
  collection: Collection | null;
  bid: Bid;
  isBidder: boolean | null;
}) {
  return (
    <PageWrapper>
      <div className="flex flex-col justify-between mb-6">
        <h1 className="text-2xl font-bold">Bid Details</h1>
        <GoBackButton />
      </div>

      <Card className="p-6 mb-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Bid Information</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">ID:</span> {bid.id}
              </p>
              <p>
                <span className="font-semibold">Price:</span> ${bid.price.toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Status:</span>{' '}
                <span className="capitalize">{bid.status}</span>
              </p>
              <p>
                <span className="font-semibold">Created:</span>{' '}
                {new Date(bid.createdAt).toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Updated:</span>{' '}
                {new Date(bid.updatedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Collection</h2>
            {collection ? (
              <div className="space-y-2">
                <p>
                  <span className="font-semibold">Name:</span> {collection.name}
                </p>
                <p>
                  <span className="font-semibold">Price:</span> $
                  {collection.price?.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className="capitalize">{collection.status}</span>
                </p>
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => router.push(`/collections/${collection.id}`)}
                >
                  View Collection
                </Button>
              </div>
            ) : (
              <p className="text-gray-600">Collection details unavailable</p>
            )}
          </div>
        </div>
      </Card>

      {/* Show bidder actions if the current user is the bid owner */}
      {isBidder && bid.status === 'pending' && (
        <div className="flex gap-3 mt-4">
          <Button
            variant="outline"
            onClick={() => router.push(`/collections/${bid.collectionId}?edit=${bid.id}`)}
          >
            Edit Bid
          </Button>

          <ConfirmationDialog
            key={`cancel-bid-dialog-${bid.id}`}
            triggerText="Cancel Bid"
            dialogTitle="Cancel Bid"
            dialogDescription="Are you sure you want to cancel this bid? This action cannot be undone."
            onConfirm={async () => {
              try {
                const response = await fetch(`/api/bids?bid_id=${bid.id}`, {
                  method: DELETE,
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                if (!response.ok) {
                  throw new Error('Failed to cancel bid');
                }

                toast.success('Bid cancelled successfully');
                router.push(`/collections/${bid.collectionId}`);
              } catch (error) {
                console.error('Error cancelling bid:', error);
                toast.error('Failed to cancel bid', {
                  description: 'Please try again later',
                });
              }
            }}
          />
        </div>
      )}
    </PageWrapper>
  );
}
