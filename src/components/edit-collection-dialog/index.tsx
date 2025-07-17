'use client';

import { Edit } from 'lucide-react';
import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';

export default function EditCollectionDialog({
  collectionId,
  onSuccess,
}: {
  collectionId: number;
  onSuccess?: () => void;
}) {
  return (
    <DynamicInputDialog
      key={`edit-collection-dialog-${collectionId}`}
      className="bg-card"
      triggerText="Edit"
      triggerIcon={Edit}
      triggerVariant="outline"
      triggerAriaLabel="open dialog to edit this collection"
      dialogTitle="Edit Collection"
      dialogDescription="Update your collection details."
      modalCategory="collection"
      method="PUT"
      collectionId={collectionId}
      onSuccess={onSuccess}
    />
  );
}
