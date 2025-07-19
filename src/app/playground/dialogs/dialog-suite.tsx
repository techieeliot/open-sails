'use client';

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import EditCollectionDialog from '@/components/edit-collection-dialog';
import { InfoDialog } from '@/components/info-dialog';

export default function DialogSuite() {
  return (
    <>
      <ConfirmationDialog
        onConfirm={(): void => {
          console.log('Confirmed!');
        }}
        triggerText={'Open Confirmation Dialog'}
      />
      <EditCollectionDialog collectionId={1} />
      <InfoDialog triggerText="Open Info Dialog" />
      <DynamicInputDialog
        method={'POST'}
        modalCategory={'collection'}
        triggerText="Open Dynamic Input Dialog"
      />
    </>
  );
}
