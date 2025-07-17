'use client';

import { BadgeAlert, Inbox } from 'lucide-react';
import { useAtomValue } from 'jotai/react';
import { useEffect } from 'react';
import LoadingIndicator from '@/components/bid-details/components/loading';
import CreateCollectionDialog from '@/components/create-collection-dialog';
import { Button } from '@/components/ui/button';
import { useFetchCollections } from '@/hooks/useFetchCollections';
import {
  collectionsErrorAtom,
  collectionsLoadingAtom,
  sortedCollectionsAtom,
  userLoginStatusAtom,
} from '@/lib/atoms';
import CollectionsTable from './components/collections-table';

export default function CollectionsIndex() {
  const sortedCollections = useAtomValue(sortedCollectionsAtom);
  const loading = useAtomValue(collectionsLoadingAtom);
  const error = useAtomValue(collectionsErrorAtom);
  const isLoggedIn = useAtomValue(userLoginStatusAtom);

  const fetchCollections = useFetchCollections();

  // Fetch collections on mount
  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return (
    <div className="flex flex-col w-full mx-auto pt-6 gap-6 overflow-hidden">
      <div className="flex flex-col md:flex-row w-full gap-4 md:gap-0 justify-between items-center mb-2">
        {!loading && isLoggedIn && (
          <>
            <h2 className="text-2xl font-bold text-foreground">All Collections</h2>
            <CreateCollectionDialog onSuccess={fetchCollections} />
          </>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 text-destructive p-6 max-w-md mx-auto flex flex-col items-center gap-2 shadow-md">
          <BadgeAlert className="w-8 h-8 mb-2" />
          <span className="font-semibold text-lg">Error loading collections</span>
          <div className="text-sm mb-2">{error}</div>
          <Button
            size="sm"
            variant="destructive"
            onClick={fetchCollections}
            disabled={loading}
            className="w-full"
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <LoadingIndicator />
      ) : !error && sortedCollections.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
          <Inbox className="h-20 w-20 text-muted-foreground" />
          <span className="text-lg text-muted-foreground font-medium">
            No collections found yet...
          </span>
          {!loading && isLoggedIn && <CreateCollectionDialog onSuccess={fetchCollections} />}
        </div>
      ) : (
        !error && <CollectionsTable />
      )}
    </div>
  );
}
