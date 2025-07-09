import { InfoDialog } from '@/components/info-dialog';
import { CollectionEntryForm } from '../collection-entry-form';
import { BidEntryForm } from '../bid-entry-form';
import { FormProps } from '@/components/interactive-form';

export interface DynamicInputDialogProps
  extends Required<Pick<FormProps, 'method' | 'triggerText'>> {
  dialogTitle: string;
  description?: string;
  modalCategory: 'collection' | 'bid';
}

export const DynamicInputDialog = ({
  modalCategory,
  method,
  ...props
}: DynamicInputDialogProps) => {
  return (
    <InfoDialog {...props}>
      {modalCategory === 'collection' ? (
        <CollectionEntryForm method={method} />
      ) : (
        <BidEntryForm method={method} />
      )}
    </InfoDialog>
  );
};
