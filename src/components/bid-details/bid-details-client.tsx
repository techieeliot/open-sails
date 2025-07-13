'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Bid, Collection, User } from '@/types';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai';
import { userSessionAtom } from '@/lib/atoms';
import LoadingPage from './pages/loading';
import BidNotFoundPage from './pages/bid-not-found';
import BidDetailsPage from './pages/bid-details';

export function BidDetailsClient() {
  const params = useParams();
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

  const isBidder = user && bid && user.id === bid.userId;

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!bid) {
    return <BidNotFoundPage />;
  }

  return <BidDetailsPage collection={collection} bid={bid} isBidder={isBidder} />;
}
