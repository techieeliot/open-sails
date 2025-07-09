'use client';

import RowItem from '@/components/row-item';
import { Button } from '@/components/ui/button';
import { BidList } from '../bids-list';
import { useEffect, useState } from 'react';
import { Collection } from '@/types';
import { DynamicInputDialog } from '../dynamic-input-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

export default function CollectionsIndex() {
  const [isOwner, setIsOwner] = useState(true); // Placeholder for owner check
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expandedCollection, setExpandedCollection] = useState<number | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      const response = await fetch('/api/collections');
      const collectionData: Collection[] = await response.json();
      setCollections(collectionData);
    };
    fetchCollections();
  }, []);

  const toggleCollection = (id: number) => {
    if (expandedCollection === id) {
      setExpandedCollection(null);
    } else {
      setExpandedCollection(id);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full max-w-8xl items-end justify-end">
      {collections.map((collection) => (
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
                  />
                  <ConfirmationDialog
                    triggerText="Delete"
                    dialogTitle="Delete Collection"
                    description="Are you sure you want to delete this collection?"
                    onConfirm={() => console.log('Collection deleted')}
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
      ))}
    </div>
  );
}
