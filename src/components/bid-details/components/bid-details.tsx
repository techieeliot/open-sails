import { formatDistanceToNow } from 'date-fns';
import { ArrowLeft, Car, CircleX } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { EditBidDialog } from '@/app/dashboard/components/edit-bid-dialog.client/index';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import GoBackButton from '@/components/go-back-button.tsx';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { DELETE } from '@/lib/constants';
import { Bid, Collection } from '@/types';

export default function BidDetailView({
  collection,
  bid,
  isBidder,
}: {
  collection: Collection | null;
  bid: Bid;
  isBidder: boolean | null;
}) {
  const router = useRouter();

  const handleDeleteBid = async () => {
    try {
      const response = await fetch(`/api/bids/${bid.id}`, {
        method: 'DELETE',
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
  };
  return (
    <>
      <div className="flex flex-col justify-between mb-6">
        <GoBackButton icon={ArrowLeft} />
      </div>

      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6">
        <Card className="bg-zinc-200 dark:bg-zinc-800">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-2xl font-bold">Bid Details</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <CardHeader>
                <CardTitle className="text-xl font-semibold mb-4">Bid Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p>
                  <span className="font-semibold">Price:</span> ${bid.price.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">Status:</span>{' '}
                  <span className="capitalize">{bid.status}</span>
                </p>
                <p>
                  <span className="font-semibold">Created:</span>{' '}
                  {formatDistanceToNow(bid.createdAt, { addSuffix: true })}
                </p>
                <p>
                  <span className="font-semibold">Updated:</span>{' '}
                  {formatDistanceToNow(bid.updatedAt, { addSuffix: true })}
                </p>
              </CardContent>
            </div>

            <div>
              <CardHeader>
                <CardTitle className="text-xl font-semibold mb-4">Collection</CardTitle>
              </CardHeader>
              {collection ? (
                <CardContent className="space-y-2">
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
                </CardContent>
              ) : (
                <CardContent>
                  <p className="text-gray-600">Collection details unavailable</p>
                </CardContent>
              )}
            </div>
          </CardContent>
          {/* Show bidder actions if the current user is the bid owner */}
          {true && bid.status === 'pending' && (
            <CardFooter>
              <CardAction className="flex gap-3 mt-4">
                <EditBidDialog
                  bid={bid}
                  onBidUpdated={function (): void {
                    router.refresh();
                  }}
                />
                <ConfirmationDialog
                  key={`cancel-bid-dialog-${bid.id}`}
                  triggerText="Cancel"
                  triggerAriaLabel="open confirmation dialog to cancel bid"
                  triggerIcon={CircleX}
                  triggerVariant="destructive"
                  dialogTitle="Cancel Bid"
                  dialogDescription="Are you sure you want to cancel this bid? This action cannot be undone."
                  onConfirm={handleDeleteBid}
                />
              </CardAction>
            </CardFooter>
          )}
        </Card>
      </div>
    </>
  );
}
