'use client';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import RowItem from '@/components/row-item';
import { Collection } from '@/types';
import { DynamicInputDialog } from '../dynamic-input-dialog';
import { BidList } from '../bids-list';
import { useAtom } from 'jotai';
import { collectionsAtom } from '@/lib/atoms';
import { toast } from 'sonner';
import Link from 'next/link';
import { API_METHODS, CONTENT_TYPE_JSON, MODAL_CATEGORY, API_ENDPOINTS } from '@/lib/constants';

interface CollectionOverviewProps extends Collection {
  setCollectionActiveState: (id: number) => void;
  fetchCollections: () => void;
  activeCollectionId: number | null;
  isOwner: boolean;
}

export const CollectionOverview = ({
  name,
  id,
  status,
  setCollectionActiveState,
  fetchCollections,
  activeCollectionId,
  isOwner,
}: CollectionOverviewProps) => {
  const [collections, setCollections] = useAtom(collectionsAtom);

  return (
    <div className="w-full">
      <RowItem rowTitle={name} onClick={() => setCollectionActiveState(id)}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status: {status}</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/collections/${id}`}>View Collection</Link>
          {isOwner ? (
            <>
              <DynamicInputDialog
                key={`edit-dialog-${id}`}
                triggerText="Edit"
                dialogTitle="Edit Collection"
                description="Fill out the form to edit the collection."
                modalCategory={MODAL_CATEGORY.COLLECTION}
                method={API_METHODS.PUT}
                collectionId={id}
                onSuccess={fetchCollections}
              />
              <ConfirmationDialog
                key={`delete-dialog-${id}`}
                triggerText="Delete"
                dialogTitle="Delete Collection"
                description="Are you sure you want to delete this collection? This will also delete all bids on this collection."
                onConfirm={async () => {
                  console.log('Delete Collection clicked');
                  try {
                    const removalConfirmationResponse = await fetch(
                      `${API_ENDPOINTS.collections}/${id}`,
                      {
                        method: API_METHODS.DELETE,
                        headers: {
                          'Content-Type': CONTENT_TYPE_JSON,
                        },
                      },
                    );
                    if (!removalConfirmationResponse.ok) {
                      throw new Error('Failed to delete collection');
                    }

                    toast.success('Collection deleted successfully', {
                      duration: 5000,
                    });
                    const updatedCollections = collections.filter((c) => c.id !== id);
                    setCollections(updatedCollections);
                    console.log('Collection deleted successfully');
                  } catch (error) {
                    let errorMessage = 'Please try again later';
                    if (error instanceof Error && error.message) {
                      errorMessage = error.message;
                    }
                    toast.error('Failed to delete collection', {
                      description: errorMessage,
                      duration: 5000,
                    });
                    console.error('Failed to delete collection:', error);
                  }
                }}
              />
            </>
          ) : (
            status !== 'closed' && (
              <DynamicInputDialog
                key={`bid-dialog-${id}`}
                triggerText="Place Bid"
                dialogTitle="Place a Bid"
                description="Fill out the form to place a bid on this collection."
                modalCategory={MODAL_CATEGORY.BID}
                method={API_METHODS.POST}
                collectionId={id}
                onSuccess={fetchCollections}
              />
            )
          )}
        </div>
      </RowItem>
      {activeCollectionId === id && <BidList isOwner={isOwner} collectionId={id} />}
    </div>
  );
};
