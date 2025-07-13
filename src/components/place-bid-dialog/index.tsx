import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { API_METHODS } from '@/lib/constants';
import { Bitcoin } from 'lucide-react';

export default function PlaceBidDialog({
  collectionId,
  onSuccess,
}: {
  collectionId: number;
  onSuccess?: () => void;
}) {
  return (
    <DynamicInputDialog
      key={`bid-dialog-${collectionId}`}
      triggerText="Place Bid"
      triggerIcon={Bitcoin}
      triggerAriaLabel="open dialog to place a bid on the collection"
      dialogTitle="Place a Bid"
      dialogDescription="Fill out the form to place a bid on this collection."
      modalCategory="bid"
      method={API_METHODS.POST}
      collectionId={collectionId}
      onSuccess={onSuccess}
    />
  );
}
