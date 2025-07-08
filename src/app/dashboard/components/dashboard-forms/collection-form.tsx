'use client';

import { Form } from '@/components/form';
import { useRouter } from 'next/navigation';

export const CollectionForm = ({ method }: { method: 'POST' | 'PUT' }) => {
  const router = useRouter();
  const formTitle = method === 'POST' ? 'Create a new collection' : 'Edit collection';
  const triggerText = method === 'POST' ? 'Create Collection' : 'Save Changes';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/api/collections', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        price: Number(data.price),
        stocks: Number(data.stocks),
      }),
    });

    if (response.ok) {
      router.refresh();
      // Optionally close the modal
    } else {
      // Handle error
      console.error('Failed to create collection');
    }
  };

  return (
    <Form formTitle={formTitle} triggerText={triggerText} method={method} onSubmit={handleSubmit}>
      <label htmlFor="name" className="text-sm font-medium">
        Name
      </label>
      <input
        id="name"
        name="name"
        type="text"
        placeholder="Enter collection name"
        className="input input-bordered w-full"
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
        required
      />
    </Form>
  );
};
