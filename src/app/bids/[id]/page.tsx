import { BidDetailsClient } from '@/components/bid-details';
import PageWrapper from '@/components/page-wrapper';

// create dynamic metadata for the page
export const dynamicMetadata = {
  title: 'Bid Details | Open Sails',
  description: 'View and manage bid details',
};

export default function BidDetailsPage() {
  return (
    <PageWrapper>
      <BidDetailsClient />
    </PageWrapper>
  );
}
