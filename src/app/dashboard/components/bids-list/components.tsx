import { Bid } from '@/types';

export const PriceBidStatus = ({
  price,
  status,
}: {
  price: Bid['price'];
  status: Bid['status'];
}) => {
  const Component = () => {
    switch (status) {
      case 'pending':
        break;
      case 'rejected':
        return (
          <div className="flex items-center gap-2">
            {/* Placeholder for bid details */}
            <span>Price: {price.toFixed(2)}</span>
            <span className="text-red-500">Rejected</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2">
            {/* Placeholder for bid details */}
            <span>Price: {price.toFixed(2)}</span>
            <span className="text-green-500">Accepted</span>
          </div>
        );
    }
  };

  return <Component />;
};
