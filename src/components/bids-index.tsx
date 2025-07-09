import { Bid } from '@/types';
import { useEffect, useState } from 'react';
import RowItem from './row-item';
import { Button } from './ui/button';

export interface BidIndexProps {
  isOwner?: boolean;
  collectionId: number;
}

export const BidList = ({ isOwner = true, collectionId }: BidIndexProps) => {
  const [bids, setBids] = useState<Bid[]>([]);

  useEffect(() => {
    if (collectionId) {
      const fetchBids = async () => {
        const response = await fetch(`/api/bids?collection_id=${collectionId}`);
        const data: Bid[] = await response.json();
        setBids(data);
      };
      fetchBids();
    }
  }, [collectionId]);

  return (
    <div className="pl-10 w-full">
      {bids.length === 0 ? (
        <div className="text-center text-muted-foreground">No bids found.</div>
      ) : (
        bids.map((bid, index) => (
          <RowItem key={bid.id} rowTitle={`Bid ${index + 1}`}>
            <div className="flex items-center gap-2">
              {/* Placeholder for bid details */}
              <span>price: {bid.price.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* If collection owner, show an icon/button to accept bid */}
              {isOwner ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => console.log('Accept Bid clicked')}
                  >
                    {/* icon */}
                    Accept
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => console.log('Reject Bid clicked')}
                  >
                    {/* icon */}
                    Reject/Cancel
                  </Button>
                </>
              ) : null}
            </div>
          </RowItem>
        ))
      )}
    </div>
  );
};
