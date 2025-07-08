import { Button } from '@/components/ui/button';
import PageWrapper from '@/components/page-wrapper';
import Link from 'next/link';

export default function Home() {
  interface MinerMetrics {
    hashrate: number; // TH/s
    efficiency: number; // J/TH
    powerDraw: number; // Watts
    dailyRevenue: number; // USD
    lastUpdated: Date;
  }

  // Challenge: Create a component that:
  // 1. Fetches and displays real-time miner metrics
  // 2. Updates efficiently (avoiding unnecessary rerenders)
  // 3. Handles loading/error states
  // 4. Implements proper TypeScript types
  // 5. Uses proper React patterns and hooks
  // 6. Handles proper data formatting

  return (
    <PageWrapper>
      <header className="flex items-center justify-center p-8">
        <h1 className="text-4xl font-bold">Welcome to Open Sail</h1>
      </header>
      {/* Authentication is optional (feel free to mock users), bonus if you can implement it. */}
      {false ? (
        <section className="flex flex-col items-center gap-4">
          <p className="text-lg">Please log in to continue</p>
          <form className="flex flex-col items-center gap-4">
            <input
              type="email"
              placeholder="Email"
              className="p-2 border border-gray-300 rounded"
            />
            <Button type="submit" variant="outline">
              Log in
            </Button>
          </form>
        </section>
      ) : (
        <section className="flex flex-col items-center gap-8">
          <Link href="/dashboard" className="text-lg font-semibold">
            Go to dashboard
          </Link>
        </section>
      )}
    </PageWrapper>
  );
}
