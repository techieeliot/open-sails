import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { FolderPlus } from 'lucide-react';

export default function CreateCollectionDialog({ onSuccess }: { onSuccess: () => void }) {
  return (
    <DynamicInputDialog
      key="create-collection-dialog"
      className="min-w-3xs bg-card"
      triggerText="New Collection"
      triggerIcon={FolderPlus}
      triggerAriaLabel="open dialog to create a new collection"
      dialogDescription="Fill out the form to create a new collection."
      modalCategory="collection"
      method="POST"
      onSuccess={onSuccess}
    />
  );
}
