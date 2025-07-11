'use client';

import PageWrapper from '@/components/page-wrapper';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Bid, Collection, User } from '@/types';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useAtomValue } from 'jotai';
import { userSessionAtom } from '@/lib/atoms';
import { DELETE } from '@/lib/constants';
import { Bitcoin } from 'lucide-react';

export function BidDetailsClient() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAtomValue(userSessionAtom);
  const [bid, setBid] = useState<Bid | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  // We'll store bidder info but remove the unused variable warning
  const [, setBidder] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBidDetails = async () => {
      try {
        setIsLoading(true);
        const bidId = params.id;

        // Fetch the bid details
        const response = await fetch(`/api/bids?bid_id=${bidId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch bid details');
        }

        const bidData = await response.json();
        setBid(bidData);

        // Fetch collection details
        if (bidData.collectionId) {
          const collectionResponse = await fetch(`/api/collections/${bidData.collectionId}`);
          if (collectionResponse.ok) {
            const collectionData = await collectionResponse.json();
            setCollection(collectionData);
          }
        }

        // Fetch user details
        if (bidData.userId) {
          const userResponse = await fetch(`/api/users?id=${bidData.userId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setBidder(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching bid details:', error);
        toast.error('Failed to fetch bid details', {
          description: 'Please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchBidDetails();
  }, [params.id]);

  const handleBack = () => {
    router.back();
  };

  const isBidder = user && bid && user.id === bid.userId;

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-gray-600">
            <Bitcoin className="animate-pulse" height={300} width={300} />
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (!bid) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <h1 className="text-2xl font-bold mb-4">Bid Not Found</h1>
          <p className="text-gray-600 mb-4">
            The bid you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col justify-between mb-6">
        <h1 className="text-2xl font-bold">Bid Details</h1>
        <Button variant="outline" onClick={handleBack}>
          Back
        </Button>
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
            triggerText="Cancel Bid"
            dialogTitle="Cancel Bid"
            description="Are you sure you want to cancel this bid? This action cannot be undone."
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
