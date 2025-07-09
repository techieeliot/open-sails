import { ConfirmationDialog } from '@/components/confirmation-dialog';
import RowItem from '@/components/row-item';
import { Collection } from '@/types';
import { DynamicInputDialog } from '../dynamic-input-dialog';
import { BidList } from '../bids-list';
import { useAtom, useAtomValue } from 'jotai';
import { collectionsAtom, userSessionAtom } from '@/lib/atoms';

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
  const { user } = useAtomValue(userSessionAtom);

  return (
    <div className="w-full">
      <RowItem rowTitle={name} onClick={() => setCollectionActiveState(id)}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Status: {status}</span>
        </div>
        <div className="flex items-center gap-2">
          {isOwner ? (
            <>
              <DynamicInputDialog
                triggerText="Edit"
                dialogTitle="Edit Collection"
                description="Fill out the form to edit the collection."
                modalCategory="collection"
                method="PUT"
                collectionId={id}
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
                      body: JSON.stringify({ id }),
                    });
                    if (!removalConfirmationResponse.ok) {
                      throw new Error('Failed to delete collection');
                    }

                    alert('Collection deleted successfully');
                    const updatedCollections = collections.filter((c) => c.id !== id);
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
            <DynamicInputDialog
              triggerText="Place Bid"
              dialogTitle="Place a Bid"
              description="Fill out the form to place a bid on this collection."
              modalCategory="bid"
              method="POST"
              collectionId={id}
              onSuccess={fetchCollections}
            />
          )}
        </div>
      </RowItem>
      {activeCollectionId === id && <BidList isOwner={isOwner} collectionId={id} />}
    </div>
  );
};
