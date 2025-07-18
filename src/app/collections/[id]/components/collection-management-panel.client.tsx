'use client';

import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import PlaceBidDialog from '@/components/place-bid-dialog';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { DELETE } from '@/lib/constants';
import { useFetchCollections } from '@/hooks/useFetchCollections';

export const CollectionAdminPanel = ({
  id,
  onCollectionUpdated,
}: {
  id: number;
  onCollectionUpdated?: () => void;
}) => {
  const router = useRouter();
  const [isOwner] = useState(true);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [collectionToEdit, setCollectionToEdit] = useState<number | null>(null);
  const fetchCollections = useFetchCollections();

  useEffect(() => {
    // do I need an if statement here?
    if (collectionToEdit !== null) {
      // fetch collections when the component mounts
      fetchCollections();
    }
  }, [fetchCollections, collectionToEdit]);

  return (
    <section className="w-full flex flex-col">
      {isOwner ? (
        <Card className="flex flex-col">
          <CardTitle className="text-lg font-semibold text-center">
            <h2>Manage Collection</h2>
          </CardTitle>
          <CardContent className="flex flex-col md:flex-row items-center gap-4">
            <DynamicInputDialog
              key={`edit-dialog-${id}`}
              triggerText="Edit"
              triggerIcon={Edit}
              triggerAriaLabel="open dialog to edit collection"
              dialogTitle="Edit Collection"
              dialogDescription="Fill out the form to edit the collection."
              modalCategory="collection"
              method="PUT"
              collectionId={id}
              onSuccess={() => {
                setShowEditDialog(false);
                setCollectionToEdit(null);
                if (onCollectionUpdated) onCollectionUpdated();
              }}
              open={showEditDialog}
              onOpenChange={(open) => {
                setShowEditDialog(open);
                setCollectionToEdit(open ? id : null);
              }}
            />
            <ConfirmationDialog
              key={`delete-dialog-${id}`}
              triggerText="Delete"
              triggerIcon={Trash2}
              triggerVariant="destructive"
              aria-label="open dialog to confirm collection deletion"
              dialogTitle="Delete Collection"
              dialogDescription="Are you sure you want to delete this collection?"
              onConfirm={async () => {
                console.log('Delete Collection clicked');
                try {
                  const removalConfirmationResponse = await fetch(`/api/collections/${id}`, {
                    method: DELETE,
                  });
                  if (!removalConfirmationResponse.ok) {
                    throw new Error('Failed to delete collection');
                  }
                  console.log('Collection deleted successfully');
                  toast.success('Collection deleted successfully', {
                    duration: 5000,
                  });
                  router.push('/dashboard');
                } catch (error) {
                  toast.error('Failed to delete collection', {
                    description: 'Please try again later',
                    duration: 5000,
                  });
                  console.error('Failed to delete collection:', error);
                }
              }}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground">
          <p>You do not have permission to manage this collection.</p>
          <div className="flex w-full justify-end">
            <PlaceBidDialog collectionId={id} />
          </div>
        </div>
      )}
    </section>
  );
};
