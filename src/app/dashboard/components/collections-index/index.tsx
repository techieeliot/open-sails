'use client';

import { BidList } from '@/components/bids-index';
import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import RowItem from '@/components/row-item';
import { Button } from '@/components/ui/button';
import { Collection } from '@/types';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useAtomValue } from 'jotai';
import { userSessionAtom } from '@/lib/atoms';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { CollectionOverview } from './collection-overview,';

export default function CollectionsIndex() {
  const { user } = useAtomValue(userSessionAtom);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expandedCollection, setExpandedCollection] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(25);

  const fetchCollections = useCallback(async () => {
    const response = await fetch('/api/collections');
    const collectionData: Collection[] = await response.json();
    setCollections(collectionData);
  }, []);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  return (
    <div className="flex flex-col gap-4 w-full h-full max-w-8xl items-end justify-end">
      <Suspense
        fallback={<div className="text-center text-muted-foreground">Loading collections...</div>}
      >
        <div className="flex w-full justify-end max-w-8xl">
          <DynamicInputDialog
            triggerText="Create Collection"
            dialogTitle="Create Collection"
            description="Fill out the form to create a new collection."
            modalCategory="collection"
            method="POST"
          />
        </div>
        {collections.length === 0 ? (
          <div className="text-center text-muted-foreground h-screen">
            No collections found yet...
          </div>
        ) : (
          collections.slice(0, visibleCount).map((collection) => {
            const isOwner = user !== null && user?.id === collection.ownerId;
            return (
              <CollectionOverview
                key={collection.id}
                isOwner={isOwner}
                setCollectionActiveState={setExpandedCollection}
                fetchCollections={fetchCollections}
                activeCollectionId={expandedCollection}
                {...collection}
              />
            );
          })
        )}
      </Suspense>
      {visibleCount < collections.length && (
        <div className="flex w-full justify-center">
          <Button onClick={() => setVisibleCount((prev) => prev + 10)} variant="outline">
            Load More Collections
          </Button>
        </div>
      )}
    </div>
  );
}
