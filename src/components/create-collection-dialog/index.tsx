import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { FolderPlus } from 'lucide-react';

export default function CreateCollectionDialog({ onSuccess }: { onSuccess: () => void }) {
  return (
    <DynamicInputDialog
      key="create-collection-dialog"
      className="min-w-3xs bg-card"
      triggerText={
        <span className="flex items-center gap-2">
          <FolderPlus className="mr-2 h-5 w-5" />
          Create Collection
        </span>
      }
      triggerVariant="secondary"
      dialogDescription="Fill out the form to create a new collection."
      modalCategory="collection"
      method="POST"
      onSuccess={onSuccess}
    />
  );
}
