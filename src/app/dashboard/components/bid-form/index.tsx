import { InteractiveForm } from '@/components/interactive-form';
import { CollectionFormProps } from '../collection-form';
import { Bid } from '@/types';
import { useAtomValue } from 'jotai';
import { userSessionAtom } from '@/lib/atoms';

export interface BidFormProps extends CollectionFormProps {
  bidId?: number;
  onSuccess?: () => void;
  closeDialog?: () => void;
}

export const BidForm = ({ method, collectionId, bidId, onSuccess, closeDialog }: BidFormProps) => {
  const { user } = useAtomValue(userSessionAtom);
  const formTitle = method === 'POST' ? 'Create a new bid' : `Edit bid ${bidId}`;
  const triggerText = method === 'POST' ? 'Create Bid' : 'Save Changes';

  if (!user) {
    return <div className="text-center text-muted-foreground">Please log in to place a bid.</div>;
  }

  if (!collectionId) {
    return <div className="text-center text-muted-foreground">No collection selected.</div>;
  }

  if (!user.id) {
    return <div className="text-center text-muted-foreground">User ID is not available.</div>;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData.entries());
    let data: Partial<Bid> = {
      ...formValues,
      price: Number(formValues.price),
      status: 'pending',
      collectionId,
      userId: user.id,
      updatedAt: new Date().toISOString(),
    };

    if (method === 'POST') {
      data = {
        ...data,
        createdAt: new Date().toISOString(),
      };
    }

    if (method === 'PUT') {
      data = {
        ...data,
        id: bidId,
        updatedAt: new Date().toISOString(),
      };
    }

    const response = await fetch('/api/bids', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      alert('Bid processed successfully');

      if (onSuccess) {
        onSuccess();
      }
      if (closeDialog) {
        closeDialog();
      }
    } else {
      // Handle error
      console.error('Failed to create or update bid');
    }
  };

  return (
    <InteractiveForm
      formTitle={formTitle}
      triggerText={triggerText}
      method={method}
      onSubmit={handleSubmit}
    >
      <label htmlFor="price" className="text-sm font-medium">
        Price of Bid
      </label>
      <input
        id="price"
        name="price"
        type="text"
        placeholder="Enter bid price"
        className="input input-bordered w-full"
        required
      />
    </InteractiveForm>
  );
};
