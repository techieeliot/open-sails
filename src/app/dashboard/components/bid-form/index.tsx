import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CollectionFormProps } from '../collection-form';
import { Bid } from '@/types';
import { useAtomValue, useSetAtom } from 'jotai';
import { bidsAtom, userSessionAtom } from '@/lib/atoms';
import { useEffect } from 'react';

export interface BidFormProps extends CollectionFormProps {
  bidId?: number;
  onSuccess?: () => void;
  closeDialog?: () => void;
}

const formSchema = z.object({
  price: z.coerce.number().positive({ message: 'Price must be a positive number.' }),
});

export const BidForm = ({ method, collectionId, bidId, onSuccess, closeDialog }: BidFormProps) => {
  const { user } = useAtomValue(userSessionAtom);
  const setBids = useSetAtom(bidsAtom);
  const bids = useAtomValue(bidsAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: 0,
    },
  });

  useEffect(() => {
    if (method === 'PUT' && bidId) {
      const bidToEdit = bids.find((bid) => bid.id === bidId);
      if (bidToEdit) {
        form.reset({
          price: bidToEdit.price,
        });
      }
    }
  }, [bidId, method, bids, form]);

  const formTitle = method === 'POST' ? 'Create a new bid' : `Edit bid ${bidId}`;

  if (!user) {
    return <div className="text-center text-muted-foreground">Please log in to place a bid.</div>;
  }

  if (!collectionId) {
    return <div className="text-center text-muted-foreground">No collection selected.</div>;
  }

  if (!user.id) {
    return <div className="text-center text-muted-foreground">User ID is not available.</div>;
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    let data: Partial<Bid> = {
      price: values.price,
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
      const updatedBids = await response.json();
      setBids(updatedBids);
      alert('Bid processed successfully');

      if (onSuccess) {
        onSuccess();
      }
      if (closeDialog) {
        closeDialog();
      }
    } else {
      console.error('Failed to create or update bid');
      alert('Failed to process bid. See console for details.');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">{formTitle}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price of Bid</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="Enter bid price" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={closeDialog}>
              Cancel
            </Button>
            <Button type="submit">{method === 'POST' ? 'Create Bid' : 'Save Changes'}</Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
