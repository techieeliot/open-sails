import { Edit } from 'lucide-react';
import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { API_METHODS } from '@/lib/constants';

export default function EditCollectionDialog({
  collectionId: collectionId,
  onSuccess,
}: {
  collectionId: number;
  onSuccess?: () => void;
}) {
  return (
    <DynamicInputDialog
      key={`edit-dialog-${collectionId}`}
      triggerText="Edit"
      triggerIcon={Edit}
      triggerAriaLabel="open dialog to edit collection"
      dialogTitle="Edit Collection"
      dialogDescription="Fill out the form to edit the collection."
      modalCategory="collection"
      method={API_METHODS.PUT}
      collectionId={collectionId}
      onSuccess={onSuccess}
    />
  );
}
