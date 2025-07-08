import { ItemModal } from '@/components/modal';
import { CollectionForm } from '../dashboard-forms/collection-form';
import { BidForm } from '../dashboard-forms/bid-form';

export const DashboardModal = ({
  triggerText,
  modalTitle: modalTitle,
  description,
  modalType,
  method,
}: {
  triggerText?: string;
  modalTitle?: string;
  description?: string;
  modalType: 'collection' | 'bid';
  method: 'POST' | 'PUT';
}) => {
  return (
    <ItemModal triggerText={triggerText} title={modalTitle} description={description}>
      {modalType === 'collection' ? (
        <CollectionForm method={method} />
      ) : (
        <BidForm method={method} />
      )}
    </ItemModal>
  );
};
