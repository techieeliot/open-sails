'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import {
  FluidFormElement,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormWrapper,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { CollectionFormProps } from '../collection-form';
import { Bid } from '@/types';
import { useAtomValue, useSetAtom } from 'jotai';
import { bidsAtom, userSessionAtom } from '@/lib/atoms';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { formSchema } from './schema';
import { POST, PUT } from '@/lib/constants';

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
    if (method === PUT && bidId) {
      const bidToEdit = bids.find((bid) => bid.id === bidId);
      if (bidToEdit) {
        form.reset({
          price: bidToEdit.price,
        });
      }
    }
  }, [bidId, method, bids, form]);

  const formTitle = method === POST ? 'Create a new bid' : `Edit bid ${bidId}`;

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

    if (method === POST) {
      data = {
        ...data,
        createdAt: new Date().toISOString(),
      };
    }

    if (method === PUT) {
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

      if (method === POST) {
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
    <div className="flex flex-col justify-center items-center p-4">
      <FormWrapper>
        <h2 className="text-lg font-semibold mb-4 text-center">{formTitle}</h2>
        <Form {...form}>
          <FluidFormElement onSubmit={form.handleSubmit(onSubmit)}>
            <div className="flex flex-col max-h-[50vh] overflow-y-auto">
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
                        autoComplete="off"
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
                    <FormMessage aria-live="polite" />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter your bid amount (minimum $0.01, maximum $1,000,000)
                    </p>
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-4 pt-4">
              <Button type="button" variant="outline" onClick={closeDialog}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex items-center justify-center"
                disabled={!form.formState.isValid || form.formState.isSubmitting}
                aria-busy={form.formState.isSubmitting}
                aria-label={method === POST ? 'Create Bid' : 'Save Changes'}
              >
                {form.formState.isSubmitting ? (
                  <Loader
                    className="animate-spin mr-2 h-4 w-4 text-zinc-900 dark:text-zinc-200"
                    aria-hidden="true"
                    focusable="false"
                  />
                ) : method === POST ? (
                  'Create Bid'
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </FluidFormElement>
        </Form>
      </FormWrapper>
    </div>
  );
};
