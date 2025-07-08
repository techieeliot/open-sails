import { Form } from '@/components/form';

export const BidForm = ({ method }: { method: 'POST' | 'PUT' }) => {
  const formTitle = method === 'POST' ? 'Create a new bid' : 'Edit bid';
  const triggerText = method === 'POST' ? 'Create Bid' : 'Save Changes';

  return (
    <Form formTitle={formTitle} triggerText={triggerText} method={method}>
      <label htmlFor="bidAmount" className="text-sm font-medium">
        Bid Amount
      </label>
      <input
        id="bidAmount"
        type="number"
        placeholder="Enter bid amount"
        className="input input-bordered w-full"
      />
    </Form>
  );
};
