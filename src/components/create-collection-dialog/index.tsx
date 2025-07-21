import { FolderPlus } from 'lucide-react';

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { API_METHODS } from '@/lib/constants';

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
      method={API_METHODS.POST}
      onSuccess={onSuccess}
      fullWidthTrigger={false}
    />
  );
}
