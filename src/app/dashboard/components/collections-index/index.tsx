'use client';

import RowItem from '@/components/row-item';
import { Button } from '@/components/ui/button';
import { BidList } from '../bids-list';
import { Suspense, useEffect, useState } from 'react';
import { Collection } from '@/types';
import { DynamicInputDialog } from '../dynamic-input-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

export default function CollectionsIndex() {
  const [isOwner, setIsOwner] = useState(true); // Placeholder for owner check
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expandedCollection, setExpandedCollection] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(25);

  const fetchCollections = async () => {
    const response = await fetch('/api/collections');
    const collectionData: Collection[] = await response.json();
    setCollections(collectionData);
  };

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  const toggleCollection = (id: number) => {
    if (expandedCollection === id) {
      setExpandedCollection(null);
    } else {
      setExpandedCollection(id);
    }
  };

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
          collections.slice(0, visibleCount).map((collection) => (
            <div key={collection.id} className="w-full">
              <RowItem rowTitle={collection.name} onClick={() => toggleCollection(collection.id)}>
                <div className="flex items-center gap-2">
                  {isOwner ? (
                    <>
                      <DynamicInputDialog
                        triggerText="Edit"
                        dialogTitle="Edit Collection"
                        description="Fill out the form to edit the collection."
                        modalCategory="collection"
                        method="PUT"
                        collectionId={collection.id}
                        onSuccess={fetchCollections}
                      />
                      <ConfirmationDialog
                        triggerText="Delete"
                        dialogTitle="Delete Collection"
                        description="Are you sure you want to delete this collection?"
                        onConfirm={async () => {
                          console.log('Delete Collection clicked');
                          try {
                            const removalConfirmationResponse = await fetch(`/api/collections`, {
                              method: 'DELETE',
                              headers: {
                                'Content-Type': 'application/json',
                              },
                              body: JSON.stringify({ id: collection.id }),
                            });
                            if (!removalConfirmationResponse.ok) {
                              throw new Error('Failed to delete collection');
                            }

                            alert('Collection deleted successfully');
                            const updatedCollections = collections.filter(
                              (c) => c.id !== collection.id,
                            );
                            setCollections(updatedCollections);
                            console.log('Collection deleted successfully');
                          } catch (error) {
                            alert('Failed to delete collection');
                            console.error('Failed to delete collection:', error);
                          }
                        }}
                      />
                    </>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Place Bid clicked');
                      }}
                    >
                      Place/Add Bid
                    </Button>
                  )}
                </div>
              </RowItem>
              {expandedCollection === collection.id && (
                <BidList isOwner={isOwner} collectionId={collection.id} />
              )}
            </div>
          ))
        )}
      </Suspense>
      {visibleCount < collections.length && (
        <div className="flex w-full justify-center">
          <Button onClick={() => setVisibleCount((prev) => prev + 10)} variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
