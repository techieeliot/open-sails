import { InfoDialog } from '@/components/info-dialog';
import { CollectionForm } from '../collection-form';
import { BidForm, BidFormProps } from '../bid-form';
import { FormProps } from '@/components/interactive-form';
import { FormWrapper } from '@/components/ui/form';
import { HtmlHTMLAttributes } from 'react';
import { Card, CardContent } from '@/components/ui/card';

export interface DynamicInputDialogProps
  extends Required<Pick<FormProps, 'method' | 'triggerText'>>,
    HtmlHTMLAttributes<HTMLDivElement> {
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
  className,
  ...props
}: DynamicInputDialogProps & BidFormProps) => {
  return (
    <Card className="bg-zinc-900">
      <CardContent className={`flex justify-center items-center ${className}`}>
        <InfoDialog {...props}>
          <FormWrapper
            className={`flex justify-center items-center max-w-sm min-w-md mx-auto p-48$`}
          >
            {modalCategory === 'collection' ? (
              <CollectionForm method={method} collectionId={collectionId} onSuccess={onSuccess} />
            ) : (
              <BidForm
                method={method}
                collectionId={collectionId}
                bidId={bidId}
                onSuccess={onSuccess}
              />
            )}
          </FormWrapper>
        </InfoDialog>
      </CardContent>
    </Card>
  );
};
