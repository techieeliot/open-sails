'use client';

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import EditCollectionDialog from '@/components/edit-collection-dialog';
import { InfoDialog } from '@/components/info-dialog';
import PageWrapper from '@/components/page-wrapper';

export default function PlaygroundDialogsPage() {
  return (
    <PageWrapper>
      <div className="flex min-h-screen flex-col items-center gap-10 bg-background text-foreground">
        <h1 className="mb-2 font-bold text-3xl">Playground Dialogs</h1>
        <p className="mb-6 text-lg opacity-80">This is a playground for testing dialogs.</p>
        <div className="flex w-full flex-col flex-wrap justify-center gap-4">
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
        </div>
      </div>
    </PageWrapper>
  );
}
