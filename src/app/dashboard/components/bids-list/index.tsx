import { ConfirmationDialog } from '@/components/confirmation-dialog';
import RowItem from '@/components/row-item';
import { Button } from '@/components/ui/button';
import { Bid } from '@/types';
import { useEffect, useState } from 'react';

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
              <span>price: {bid.amount.toFixed(2)}</span>
            </div>
            <div className="flex items-center gap-2">
              {/* If collection owner, show an icon/button to accept bid */}
              {isOwner ? (
                <>
                  <ConfirmationDialog
                    triggerText="Accept"
                    dialogTitle="Accept Bid"
                    description="Are you sure you want to accept this bid?"
                    onConfirm={() => console.log('Bid accepted')}
                  />
                  <ConfirmationDialog
                    triggerText="Reject"
                    dialogTitle="Reject Bid"
                    description="Are you sure you want to reject this bid?"
                    onConfirm={() => console.log('Bid rejected')}
                  />
                </>
              ) : null}
            </div>
          </RowItem>
        ))
      )}
    </div>
  );
};
