'use client';

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
import { toast } from 'sonner';
import { formSchema } from './schema';

export interface BidFormProps extends CollectionFormProps {
  bidId?: number;
  onSuccess?: () => void;
  closeDialog?: () => void;
}

export const BidForm = ({ method, collectionId, bidId, onSuccess, closeDialog }: BidFormProps) => {
  const { user } = useAtomValue(userSessionAtom);
  const setBids = useSetAtom(bidsAtom);
  const bids = useAtomValue(bidsAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      price: undefined, // Changed from 0 to undefined to show placeholder
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

      if (method === 'POST') {
        toast.success('Bid placed successfully!', {
          description: 'Your bid has been recorded and is awaiting review.',
          duration: 5000,
        });
      } else {
        toast.success('Bid updated successfully!', {
          duration: 3000,
        });
      }

      if (onSuccess) {
        onSuccess();
      }
      if (closeDialog) {
        closeDialog();
      }
    } else {
      console.error('Failed to create or update bid');
      toast.error('Failed to process bid', {
        description: 'Please check your bid details and try again.',
        duration: 5000,
      });
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
                <FormLabel>Bid Price ($)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    min="0.01"
                    max="1000000"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow empty string for clearing the field
                      if (value === '') {
                        field.onChange('');
                        return;
                      }
                      // Parse and validate the number
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        field.onChange(numValue);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your bid amount (minimum $0.01, maximum $1,000,000)
                </p>
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
