import { FormProps, InteractiveForm } from '@/components/interactive-form';

export const BidEntryForm = ({ method }: { method: FormProps['method'] }) => {
  const formTitle = method === 'POST' ? 'Create a new bid' : 'Edit bid';
  const triggerText = method === 'POST' ? 'Create Bid' : 'Save Changes';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());

    const response = await fetch('/api/bids', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...data,
        price: Number(data.price),
      }),
    });

    if (response.ok) {
      // Optionally refresh the page or close the modal
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
