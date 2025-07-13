import { InfoDialog } from '@/components/info-dialog';
import { CollectionForm } from '../collection-form';
import { BidForm, BidFormProps } from '../bid-form';
import { HtmlHTMLAttributes } from 'react';
import { DialogModalProps } from '@/types';

export interface DynamicInputDialogProps
  extends HtmlHTMLAttributes<HTMLDivElement>,
    DialogModalProps {
  method: 'POST' | 'PUT';
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
  const form =
    modalCategory === 'collection' ? (
      <CollectionForm method={method} collectionId={collectionId} onSuccess={onSuccess} />
    ) : (
      <BidForm method={method} collectionId={collectionId} bidId={bidId} onSuccess={onSuccess} />
    );

  return <InfoDialog {...props}>{form}</InfoDialog>;
};
