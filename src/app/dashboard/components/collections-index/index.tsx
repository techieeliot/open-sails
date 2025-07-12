'use client';

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { Button } from '@/components/ui/button';
import { Collection } from '@/types';
import { Fragment, Suspense, useCallback, useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { collectionsAtom, userSessionAtom } from '@/lib/atoms';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Bitcoin, FolderPlus } from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/constants';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { VariantProps } from 'class-variance-authority';

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
      const response = await fetch(API_ENDPOINTS.collections);

      console.log('Collections response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Collections API error response:', errorText);
        throw new Error(`Failed to fetch collections: ${response.status} - ${errorText}`);
      }

      const collectionData: Collection[] = await response.json();
      console.log('Received collection data:', collectionData.length, 'collections');

      if (Array.isArray(collectionData)) {
        // Sort collections by createdAt date (newest first)
        const sortedCollections = [...collectionData].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setCollections(sortedCollections);
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
    <div className="flex flex-col gap-6 w-full h-full max-w-8xl mx-auto p-4">
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground">
            <Bitcoin className="animate-pulse" height={300} width={300} />
          </div>
        }
      >
        <div className="flex w-full items-end justify-end max-w-8xl h-32">
          {!loading && user && (
            <DynamicInputDialog
              key="create-collection-dialog"
              className="min-w-3xs bg-card"
              triggerText={
                <span className="flex items-center gap-2">
                  <FolderPlus className="mr-2 h-5 w-5" />
                  Create Collection
                </span>
              }
              dialogTitle="Create Collection"
              description="Fill out the form to create a new collection."
              modalCategory="collection"
              method="POST"
              onSuccess={fetchCollections}
            />
          )}
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
          <div className="text-center text-muted-foreground min-w-md">
            <Bitcoin className="animate-pulse" height={500} width={500} />
          </div>
        ) : collections.length === 0 && !error ? (
          <div className="text-center text-muted-foreground h-screen">
            No collections found yet...
          </div>
        ) : (
          !error && (
            <Table className="w-full border-separate border-spacing-y-6">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-lg font-bold">Collection</TableHead>
                  <TableHead className="w-1/3">Status</TableHead>
                  <TableHead className="w-1/3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.slice(0, visibleCount).map((collection) => {
                  const isOwner = user !== null && user?.id === collection.ownerId;
                  const isExpanded = expandedCollection === collection.id;
                  const badgeVariant = collection.status === 'open' ? 'default' : 'struckthrough';
                  return (
                    <Fragment key={collection.id}>
                      <TableRow
                        key={collection.id}
                        className="bg-card rounded-2xl shadow-md border border-border align-top"
                      >
                        <TableCell className="align-top rounded-l-2xl font-semibold text-base py-6">
                          {collection.name}
                        </TableCell>
                        <TableCell className="align-top py-6">
                          <Badge variant={badgeVariant as BadgeProps['variant']}>
                            {collection.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="align-top text-right rounded-r-2xl py-6">
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                setExpandedCollection(isExpanded ? null : collection.id)
                              }
                            >
                              {isExpanded ? 'Hide Bids' : 'Show Bids'}
                            </Button>
                            <Button size="sm" variant="outline" asChild>
                              <a href={`/collections/${collection.id}`}>View</a>
                            </Button>
                            {isOwner && (
                              <>
                                <DynamicInputDialog
                                  key={`edit-dialog-${collection.id}`}
                                  triggerText="Edit"
                                  dialogTitle="Edit Collection"
                                  description="Fill out the form to edit the collection."
                                  modalCategory="collection"
                                  method="PUT"
                                  collectionId={collection.id}
                                  onSuccess={fetchCollections}
                                />
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={async () => {
                                    // You may want to add a confirmation dialog here
                                    await fetch(`${API_ENDPOINTS.collections}/${collection.id}`, {
                                      method: 'DELETE',
                                    });
                                    fetchCollections();
                                  }}
                                >
                                  Delete
                                </Button>
                              </>
                            )}
                            {!isOwner && collection.status !== 'closed' && (
                              <DynamicInputDialog
                                key={`bid-dialog-${collection.id}`}
                                triggerText="Place Bid"
                                dialogTitle="Place a Bid"
                                description="Fill out the form to place a bid on this collection."
                                modalCategory="bid"
                                method="POST"
                                collectionId={collection.id}
                                onSuccess={fetchCollections}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-transparent">
                          <TableCell colSpan={3} className="p-0">
                            {/* Bids Table for this collection */}
                            <div className="w-full px-8 pb-8">
                              {/* Replace with your actual BidList or similar component */}
                              <div className="rounded-2xl border border-border bg-card/80 p-4 mt-2">
                                <div className="font-semibold mb-2 text-accent">Bids</div>
                                {/* TODO: Render bids for this collection here, using a Table or List */}
                                <div className="text-muted-foreground italic">No bids yet...</div>
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )
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
