import { BidDetailsClient } from '@/components/bid-details';
import PageWrapper from '@/components/page-wrapper';

// Correct Next.js metadata export
export const metadata = {
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
