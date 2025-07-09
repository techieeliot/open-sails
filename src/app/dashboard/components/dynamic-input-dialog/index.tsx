import { InfoDialog } from '@/components/info-dialog';
import { CollectionForm } from '../collection-form';
import { BidForm, BidFormProps } from '../bid-form';
import { FormProps } from '@/components/interactive-form';

export interface DynamicInputDialogProps
  extends Required<Pick<FormProps, 'method' | 'triggerText'>> {
  dialogTitle: string;
  description?: string;
  modalCategory: 'collection' | 'bid';
  onSuccess?: () => void;
}

export const DynamicInputDialog = ({
  modalCategory,
  method,
  collectionId,
  bidId,
  onSuccess,
  ...props
}: DynamicInputDialogProps & BidFormProps) => {
  return (
    <InfoDialog {...props}>
      {modalCategory === 'collection' ? (
        <CollectionForm method={method} collectionId={collectionId} onSuccess={onSuccess} />
      ) : (
        <BidForm method={method} collectionId={collectionId} bidId={bidId} onSuccess={onSuccess} />
      )}
    </InfoDialog>
  );
};
