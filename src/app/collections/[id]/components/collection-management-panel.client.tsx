'use client';

import { Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
// Poll for collection update or deletion
async function pollForCollectionUpdateOrDelete(
  collectionId: number,
  shouldExist: boolean,
  maxAttempts = 10,
  interval = 1500,
) {
  let attempts = 0;
  while (attempts < maxAttempts) {
    const res = await fetch(`/api/collections/${collectionId}`);
    if (shouldExist) {
      if (res.ok) {
        return true;
      }
    } else {
      if (res.status === 404) {
        return true;
      }
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
    attempts++;
  }
  return false;
}
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
    <section className="w-full flex flex-col items-center">
      {isOwner ? (
        <Card className="w-full max-w-md md:max-w-lg border border-primary/30 bg-card/80 shadow-2xl rounded-2xl p-0 md:p-2">
          <CardTitle className="text-xl font-bold text-center pt-6 pb-2 tracking-tight">
            Manage Collection
          </CardTitle>
          <CardContent className="flex flex-col gap-4 px-4 pb-6">
            <div className="flex flex-col gap-3 md:flex-row md:gap-4 w-full mt-2">
              <div className="w-full md:w-auto">
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
                  onSuccess={async () => {
                    setShowEditDialog(false);
                    setCollectionToEdit(null);
                    const toastId = toast.loading('Saving changes and waiting for backend...');
                    const polled = await pollForCollectionUpdateOrDelete(id, true);
                    toast.dismiss(toastId);
                    if (polled) {
                      toast.success('Collection updated and backend confirmed!');
                    } else {
                      toast.warning(
                        'Collection updated, but backend did not confirm in time. Please refresh.',
                      );
                    }
                    if (onCollectionUpdated) onCollectionUpdated();
                  }}
                  open={showEditDialog}
                  onOpenChange={(open) => {
                    setShowEditDialog(open);
                    setCollectionToEdit(open ? id : null);
                  }}
                  triggerVariant="outline"
                  fullWidthTrigger={true}
                />
              </div>
              <div className="w-full md:w-auto">
                <ConfirmationDialog
                  key={`delete-dialog-${id}`}
                  triggerText="Delete"
                  triggerIcon={Trash2}
                  triggerVariant="destructive"
                  aria-label="open dialog to confirm collection deletion"
                  dialogTitle="Delete Collection"
                  dialogDescription="Are you sure you want to delete this collection?"
                  onConfirm={async () => {
                    try {
                      const removalConfirmationResponse = await fetch(`/api/collections/${id}`, {
                        method: DELETE,
                      });
                      if (!removalConfirmationResponse.ok) {
                        throw new Error('Failed to delete collection');
                      }
                      const toastId = toast.loading(
                        'Deleting collection and waiting for backend...',
                      );
                      const polled = await pollForCollectionUpdateOrDelete(id, false);
                      toast.dismiss(toastId);
                      if (polled) {
                        toast.success('Collection deleted and backend confirmed!', {
                          duration: 5000,
                        });
                      } else {
                        toast.warning(
                          'Collection deleted, but backend did not confirm in time. Please refresh.',
                          { duration: 5000 },
                        );
                      }
                      router.push('/dashboard');
                    } catch (error) {
                      toast.error('Failed to delete collection', {
                        description: 'Please try again later',
                        duration: 5000,
                      });
                      console.error('Failed to delete collection:', error);
                    }
                  }}
                  fullWidthTrigger={true}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center text-muted-foreground w-full max-w-md md:max-w-lg">
          <p className="mb-4">You do not have permission to manage this collection.</p>
          <div className="flex w-full justify-end">
            <PlaceBidDialog collectionId={id} />
          </div>
        </div>
      )}
    </section>
  );
};
