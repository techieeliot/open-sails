import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { CONTENT_TYPE_JSON, DELETE } from '@/lib/constants';
import { safeStringify } from '@/lib/utils';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function DeleteCollectionDialog({
  collectionId,
  onSuccess,
}: {
  collectionId: number;
  onSuccess: () => void;
}) {
  return (
    <ConfirmationDialog
      key={`delete-dialog-${collectionId}`}
      triggerText={
        <span>
          <Trash2 className="h-5 w-5" />
          <VisuallyHidden>Delete Collection</VisuallyHidden>
        </span>
      }
      dialogTitle="Delete Collection"
      dialogDescription="Are you sure you want to delete this collection? This action cannot be undone."
      triggerVariant="destructive"
      onConfirm={async () => {
        try {
          const response = await fetch(`/api/collections?id=${collectionId}`, {
            method: DELETE,
            headers: {
              'Content-Type': CONTENT_TYPE_JSON,
            },
            body: JSON.stringify({ id: collectionId }),
          });
          if (!response.ok) {
            throw new Error('Failed to delete collection');
          }
          toast.success('Collection deleted successfully');
          onSuccess();
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
