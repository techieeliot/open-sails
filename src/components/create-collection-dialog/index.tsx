import { FolderPlus } from 'lucide-react';

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';

export default function CreateCollectionDialog({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <DynamicInputDialog
      key="create-collection-dialog"
      className="bg-card"
      triggerText="New Collection"
      triggerIcon={FolderPlus}
      triggerVariant="default"
      triggerAriaLabel="open dialog to create a new collection"
      dialogDescription="Fill out the form to create a new collection."
      modalCategory="collection"
      method="POST"
      onSuccess={onSuccess}
      fullWidthTrigger={false}
    />
  );
}
