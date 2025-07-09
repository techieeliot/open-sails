'use client';

import { FormProps, InteractiveForm } from '@/components/interactive-form';
import { userSessionAtom } from '@/lib/atoms';
import { Collection } from '@/types';
import { useAtomValue } from 'jotai';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export interface CollectionFormProps extends Pick<FormProps, 'method'> {
  collectionId?: number;
  onSuccess?: () => void;
  closeDialog?: () => void;
}

export const CollectionForm = ({
  method,
  collectionId,
  onSuccess,
  closeDialog,
}: CollectionFormProps) => {
  const router = useRouter();
  const { user } = useAtomValue(userSessionAtom);
  const formTitle = method === 'POST' ? 'Create a new collection' : 'Edit collection';
  const triggerText = method === 'POST' ? 'Create Collection' : 'Save Changes';

  let formData: Partial<Collection> = {
    name: '',
    descriptions: '',
    price: 0,
    stocks: 0,
    updatedAt: new Date().toISOString(),
  };

  // fetch initial data if method is PUT
  if (method === 'PUT' && collectionId) {
    // Fetch the collection data to pre-fill the form
    // This could be done with a useEffect hook or similar, but for simplicity,
    // we will assume the data is fetched and available in the form.
    // You would typically fetch the data here and set it in the form fields.
    // Example:
    const fetchCollectionData = async () => {
      const response = await fetch(`/api/collections/${collectionId}`);
      const data: Collection = await response.json();
      formData = {
        ...data,
        price: Number(data.price),
        stocks: Number(data.stocks),
        updatedAt: new Date().toISOString(),
      };
    };

    useEffect(() => {
      fetchCollectionData();
    }, [collectionId]);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formValues = Object.fromEntries(formData.entries());

    let data: Partial<Collection> = {
      ...formValues,
      price: Number(formValues.price),
      stocks: Number(formValues.stocks),
      updatedAt: new Date().toISOString(),
    };

    if (method === 'POST') {
      data = {
        ...data,
        ownerId: user?.id,
        createdAt: new Date().toISOString(),
      };
    }

    if (method === 'PUT') {
      data = {
        ...data,
        id: collectionId,
      };
    }

    const response = await fetch('/api/collections', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    console.log('Response status:', response.status);
    if (response.ok) {
      alert('Collection processed successfully');
      if (onSuccess) {
        onSuccess();
      }
      if (closeDialog) {
        closeDialog();
      }

      if (method === 'POST') {
        const data = await response.json();
        router.push(`/collections/${data.id}`);
      }
      console.log('Collection action successful');
    } else {
      // Handle error
      console.error('Failed to process collection');
    }
  };

  return (
    <InteractiveForm
      formTitle={formTitle}
      triggerText={triggerText}
      method={method}
      onSubmit={handleSubmit}
    >
      <label htmlFor="name" className="text-sm font-medium">
        Name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder="Enter collection name"
        className="input input-bordered w-full"
        defaultValue={formData.name || ''}
        required
      />
      <label htmlFor="descriptions" className="text-sm font-medium">
        Description
      </label>
      <textarea
        id="descriptions"
        name="descriptions"
        placeholder="Enter collection description"
        className="textarea textarea-bordered w-full"
        defaultValue={formData.descriptions || ''}
        required
      />
      <label htmlFor="price" className="text-sm font-medium">
        Price
      </label>
      <input
        id="price"
        name="price"
        type="number"
        placeholder="Enter price"
        className="input input-bordered w-full"
        defaultValue={formData.price || ''}
        required
      />
      <label htmlFor="stocks" className="text-sm font-medium">
        Stock
      </label>
      <input
        id="stocks"
        name="stocks"
        type="number"
        placeholder="Enter stock quantity"
        className="input input-bordered w-full"
        defaultValue={formData.stocks || ''}
        required
      />
    </InteractiveForm>
  );
};
