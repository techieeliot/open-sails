'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAtomValue, useSetAtom } from 'jotai';
import { Loader } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  FluidFormElement,
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormWrapper,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFetchCollections } from '@/hooks/useFetchCollections';
import { bidsAtom, collectionsAtom, userSessionAtom } from '@/lib/atoms';
import { CONTENT_TYPE_JSON, POST, PUT } from '@/lib/constants';
import { parseNumeric } from '@/lib/utils';
import { Bid } from '@/types';
import { CollectionFormProps } from '../collection-form';
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
  const collections = useAtomValue(collectionsAtom);
  const fetchCollections = useFetchCollections();

  // Find the collection by ID or default to an empty object
  const collection = collections.find((c) => c.id === collectionId);
  const collectionPrice = collection ? parseNumeric(collection.price) : 0;
  const minBidPrice = collectionPrice + 0.01;

  const dynamicFormSchema = z.object({
    price: z.number().min(minBidPrice, 'Bid must be greater than current price $' + minBidPrice),
  });

  const form = useForm<z.infer<typeof dynamicFormSchema>>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      price: undefined,
    },
  });

  useEffect(() => {
    if (method === PUT && bidId) {
      const bidToEdit = bids.find((bid) => bid.id === bidId);
      if (bidToEdit) {
        form.reset({
          price: parseNumeric(bidToEdit.price),
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
      price: values.price.toString(),
      status: 'pending',
      collectionId,
      userId: user.id,
    };

    if (method === POST) {
      data = {
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    if (method === PUT) {
      data = {
        ...data,
        updatedAt: new Date().toISOString(),
        id: bidId,
      };
    }

    const response = await fetch('/api/bids', {
      method,
      headers: {
        'Content-Type': CONTENT_TYPE_JSON,
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
          action: {
            label: 'View Collections',
            onClick: () => (window.location.href = '/collections'),
          },
        });
      } else {
        toast.success('Bid updated successfully!', {
          description: 'Your bid details have been updated.',
          duration: 3000,
          action: {
            label: 'View Bids',
            onClick: () => (window.location.href = '/bids'),
          },
        });
      }

      fetchCollections();

      if (onSuccess) {
        onSuccess();
      }
      if (closeDialog) {
        closeDialog();
      }
    } else {
      const errorText = await response.text();
      console.error('Failed to create or update bid:', errorText);
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
                    <FormDescription className="text-xs text-muted-foreground mt-1">
                      Enter your bid amount (must be greater than current price ${minBidPrice},
                      maximum $1,000,000)
                    </FormDescription>
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
BidForm.displayName = 'BidForm';
