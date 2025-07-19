import PageWrapper from '@/components/page-wrapper';
import CollectionsIndex from './components/collections-index';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Open Sails',
  description: 'User dashboard for Open Sails',
};

export default function DashboardPage() {
  // Challenge: Create a component that:
  // 1. Fetches and displays real-time miner hardware collections and their bids
  // 2. Updates efficiently (avoiding unnecessary rerenders)
  // 3. Handles loading/error states
  // 4. Implements proper TypeScript types
  // 5. Uses proper React patterns and hooks
  // 6. Handles proper data formatting

  return (
    <PageWrapper>
      <section className="flex w-full flex-col gap-8 bg-background text-foreground">
        <CollectionsIndex />
      </section>
    </PageWrapper>
  );
}
