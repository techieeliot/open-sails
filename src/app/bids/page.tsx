import PageWrapper from '@/components/page-wrapper';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bids - Open Sails',
  description: 'User bids page for Open Sails',
};

export default function BidsPage() {
  return (
    <PageWrapper>
      <h1>Bids Page</h1>
      {/* Add your bids page content here */}
      <p className="text-gray-600">
        This is the bids page where you can search and view a list of bids.
      </p>
    </PageWrapper>
  );
}
