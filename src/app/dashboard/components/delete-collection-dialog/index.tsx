import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useFetchCollections } from '@/hooks/useFetchCollections';
import { CONTENT_TYPE_JSON, DELETE } from '@/lib/constants';
import { safeStringify } from '@/lib/utils';

export default function DeleteCollectionDialog({
  collectionId,
  onSuccess,
}: {
  collectionId: number;
  onSuccess?: () => void;
}) {
  const fetchCollections = useFetchCollections();
  return (
    <ConfirmationDialog
      key={`delete-dialog-${collectionId}`}
      triggerText="Delete"
      triggerIcon={Trash2}
      triggerVariant="destructive"
      triggerAriaLabel="open dialog to confirm collection deletion"
      dialogTitle="Delete Collection"
      dialogDescription="Are you sure you want to delete this collection?"
      onConfirm={async () => {
        try {
          const response = await fetch(`/api/collections/${collectionId}`, {
            method: DELETE,
            headers: {
              'Content-Type': CONTENT_TYPE_JSON,
            },
          });
          if (!response.ok) {
            throw new Error('Failed to delete collection');
          }
          toast.success('Collection deleted successfully');

          fetchCollections();

          if (onSuccess) {
            console.log('Collection deleted successfully, calling onSuccess callback');
            onSuccess();
          }
        } catch (error) {
          toast.error('Failed to delete collection', {
            description: 'Please try again later',
          });
          console.error('Failed to delete collection:', safeStringify(error));
        }
      }}
    />
  );
}
