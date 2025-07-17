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
            method: 'DELETE',
            headers: {
              'Content-Type': CONTENT_TYPE_JSON,
            },
          });
          if (!response.ok) {
            let errorMsg = 'Failed to delete collection';
            try {
              const errorData = await response.json();
              errorMsg = errorData.message || errorMsg;
            } catch {}
            throw new Error(errorMsg);
          }
          toast.success('Collection deleted successfully');
          fetchCollections();
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          const msg = error instanceof Error ? error.message : 'Unknown error';
          toast.error('Failed to delete collection', {
            description: msg,
          });
          console.error('Failed to delete collection:', safeStringify(error));
        }
      }}
    />
  );
}
