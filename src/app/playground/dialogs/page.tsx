import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import EditCollectionDialog from '@/components/edic-collection-dialog';
import { InfoDialog } from '@/components/info-dialog';
import PageWrapper from '@/components/page-wrapper';

export default function PlaygroundDialogsPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center gap-10 min-h-screen bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-2">Playground Dialogs</h1>
        <p className="mb-6 text-lg opacity-80">This is a playground for testing dialogs.</p>
        <div className="flex flex-col flex-wrap gap-4 justify-center w-full">
          <ConfirmationDialog
            onConfirm={function (): void {
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
