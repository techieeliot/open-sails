'use client';

import RowItem from '@/components/row-item';
import { Button } from '@/components/ui/button';
import { BidsIndex } from '../bids-index';
import { useEffect, useState } from 'react';

interface Collection {
  id: number;
  name: string;
  descriptions: string;
  price: number;
  stocks: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function CollectionsIndex() {
  const [isOwner, setIsOwner] = useState(true); // Placeholder for owner check
  const [collections, setCollections] = useState<Collection[]>([]);
  const [expandedCollection, setExpandedCollection] = useState<number | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      const response = await fetch('/api/collections');
      const data = await response.json();
      setCollections(data);
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
          <RowItem title={collection.name} onClick={() => toggleCollection(collection.id)}>
            <div className="flex items-center gap-2">
              {isOwner ? (
                <>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Edit Collection clicked');
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Delete Collection clicked');
                    }}
                  >
                    Delete
                  </Button>
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
            <BidsIndex isOwner={isOwner} collectionId={collection.id} />
          )}
        </div>
      ))}
    </div>
  );
}
