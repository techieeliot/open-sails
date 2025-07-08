import RowItem from '@/components/row-item';
import { Button } from '@/components/ui/button';

export const BidsIndex = ({ isOwner = true }) => {
  // This is a placeholder for the bids data.
  const bids = [
    { id: 1, amount: 100 },
    { id: 2, amount: 200 },
  ];

  return (
    <div>
      {bids.length === 0 ? (
        <div className="text-center text-muted-foreground">No bids found.</div>
      ) : (
        bids.map((bid, index) => (
          <RowItem key={bid.id} title={`Bid ${index + 1}`}>
            <div className="flex items-center gap-2">
              {/* Placeholder for bid details */}
              <span>Bid amount: {bid.amount}</span>
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
