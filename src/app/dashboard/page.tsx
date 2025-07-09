import PageWrapper from '@/components/page-wrapper';
import { DynamicInputDialog } from './components/dynamic-input-dialog';
import CollectionsIndex from './components/collections-index';

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
      <section className="flex flex-col items-center gap-8 min-w-lg">
        <CollectionsIndex />
      </section>
    </PageWrapper>
  );
}
