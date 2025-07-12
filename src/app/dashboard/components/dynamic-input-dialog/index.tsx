import { InfoDialog } from '@/components/info-dialog';
import { CollectionForm } from '../collection-form';
import { BidForm, BidFormProps } from '../bid-form';
import { FormWrapper } from '@/components/ui/form';
import { HtmlHTMLAttributes, ReactNode } from 'react';

export interface DynamicInputDialogProps extends HtmlHTMLAttributes<HTMLDivElement> {
  method: 'POST' | 'PUT';
  triggerText: ReactNode;
  dialogTitle: ReactNode;
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
  className,
  ...props
}: DynamicInputDialogProps & BidFormProps) => {
  // Remove closeDialog from ...props so it doesn't leak to DOM
  const { closeDialog, ...restProps } = props;
  const form =
    modalCategory === 'collection' ? (
      <CollectionForm
        method={method}
        collectionId={collectionId}
        onSuccess={onSuccess}
        closeDialog={closeDialog}
      />
    ) : (
      <BidForm
        method={method}
        collectionId={collectionId}
        bidId={bidId}
        onSuccess={onSuccess}
        closeDialog={closeDialog}
      />
    );

  return (
    <InfoDialog {...restProps}>
      <FormWrapper className="flex flex-col gap-6 justify-center items-center min-w-md mx-auto">
        {form}
      </FormWrapper>
    </InfoDialog>
  );
};
