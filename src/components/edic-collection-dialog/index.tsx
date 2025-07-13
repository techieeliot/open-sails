import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { API_METHODS } from '@/lib/constants';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Edit } from 'lucide-react';

export default function EditCollectionDialog({
  collectionId: collectionId,
  onSuccess,
}: {
  collectionId: number;
  onSuccess: () => void;
}) {
  return (
    <DynamicInputDialog
      key={`edit-dialog-${collectionId}`}
      triggerText={
        <span>
          <Edit className="h-5 w-5" />
          <VisuallyHidden>Edit Collection</VisuallyHidden>
        </span>
      }
      dialogTitle="Edit Collection"
      dialogDescription="Fill out the form to edit the collection."
      modalCategory="collection"
      method={API_METHODS.PUT}
      collectionId={collectionId}
      onSuccess={onSuccess}
    />
  );
}
