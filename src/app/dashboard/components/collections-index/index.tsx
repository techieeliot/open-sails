'use client';

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { Button } from '@/components/ui/button';
import { Collection } from '@/types';
import { Suspense, useCallback, useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { collectionsAtom, userSessionAtom } from '@/lib/atoms';
import { CollectionOverview } from './collection-overview';

export default function CollectionsIndex() {
  const { user } = useAtomValue(userSessionAtom);
  const [collections, setCollections] = useAtom(collectionsAtom);
  const [expandedCollection, setExpandedCollection] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching collections from API...');
      const response = await fetch('/api/collections');

      console.log('Collections response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Collections API error response:', errorText);
        throw new Error(`Failed to fetch collections: ${response.status} - ${errorText}`);
      }

      const collectionData: Collection[] = await response.json();
      console.log('Received collection data:', collectionData.length, 'collections');

      if (Array.isArray(collectionData)) {
        setCollections(collectionData);
      } else {
        throw new Error('Received invalid data format for collections');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load collections';
      setError(errorMessage);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [setCollections]);

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
            onSuccess={fetchCollections}
          />
        </div>

        {error && (
          <div className="p-4 border border-red-300 rounded-lg bg-red-50 text-red-700 max-w-md mx-auto">
            <div className="font-medium mb-2">Error loading collections</div>
            <div className="text-sm mb-3">{error}</div>
            <Button size="sm" variant="outline" onClick={fetchCollections} disabled={loading}>
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground">Loading collections...</div>
        ) : collections.length === 0 && !error ? (
          <div className="text-center text-muted-foreground h-screen">
            No collections found yet...
          </div>
        ) : (
          !error &&
          collections.slice(0, visibleCount).map((collection) => {
            const isOwner = user !== null && user?.id === collection.ownerId;
            return (
              <CollectionOverview
                key={collection.id}
                isOwner={isOwner}
                setCollectionActiveState={() =>
                  setExpandedCollection(expandedCollection === collection.id ? null : collection.id)
                }
                fetchCollections={fetchCollections}
                activeCollectionId={expandedCollection}
                {...collection}
              />
            );
          })
        )}
      </Suspense>
      {!loading && !error && visibleCount < collections.length && (
        <div className="flex w-full justify-center">
          <Button onClick={() => setVisibleCount((prev) => prev + 10)} variant="outline">
            Load More Collections
          </Button>
        </div>
      )}
    </div>
  );
}
