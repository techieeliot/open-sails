'use client';

import RowItem from '@/components/row-item';
import { Button } from '@/components/ui/button';
import { BidsIndex } from '../bids-index';
import { useState } from 'react';

export default function CollectionsIndex() {
  const [isOwner, setIsOwner] = useState(true); // Placeholder for owner check

  return (
    <div className="flex flex-col gap-4 w-full max-w-8xl items-end justify-end">
      {/* 
        Create a nested table/section to display the list of collections, with
         - list of bids under each collection
         - if collection owner
          - an icon/button to update/delete collection
          - an icon/button to accept bid
        - otherwise, an icon/button to add/edit/cancel bid
 */}
      <RowItem title="Collection 1">
        <div className="flex items-center gap-2">
          {/* 
            if collection owner
                an icon/button to update/delete collection
            */}
          {isOwner ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => console.log('Edit Collection clicked')}
              >
                {/* icon */}
                Edit
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => console.log('Delete Collection clicked')}
              >
                {/* icon */}
                Delete
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="outline"
              onClick={() => console.log('Place Bid clicked')}
            >
              {/* icon */}
              Place/Add Bid
            </Button>
          )}
        </div>
      </RowItem>
      <BidsIndex isOwner={true} />
    </div>
  );
}
