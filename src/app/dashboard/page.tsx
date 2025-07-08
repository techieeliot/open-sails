import { Button } from '@/components/ui/button';
import PageWrapper from '@/components/page-wrapper';
import CollectionsIndex from '../../components/collections-index';

export default function DashboardPage() {
  const collections: object[] = []; // Placeholder for collections data
  return (
    <PageWrapper>
      <section className="flex flex-col items-center gap-8 min-w-lg">
        {/* Placeholder for collections and bids table */}
        <div className="flex w-full justify-end max-w-8xl p-4 rounded-lg shadow-md">
          <Button type="button" variant="outline">
            Create
          </Button>
        </div>
        {collections.length === 0 ? (
          <div className="w-full max-w-8xl p-4 rounded-lg shadow-md">
            <p className="text-center text-gray-500">
              {/* icon */}
              No collections available yet.
            </p>
          </div>
        ) : (
          // collections.map((collection) => (
          // add key when mapping
          <CollectionsIndex />
          // ))
        )}
      </section>
    </PageWrapper>
  );
}
