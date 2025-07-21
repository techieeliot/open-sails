'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAtomValue, useSetAtom } from 'jotai';
import { Loader, DollarSign, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useFetchCollections } from '@/hooks/useFetchCollections';
import { bidsAtom, collectionsAtom, userSessionAtom } from '@/lib/atoms';
import { CONTENT_TYPE_JSON, POST, PUT } from '@/lib/constants';
import { formatPrice, parseNumeric } from '@/lib/utils';
import type { Bid } from '@/types';
import { BidFormSkeleton } from './bid-form-skeleton';
import type { CollectionFormProps } from '../collection-form';
import type { formSchema } from './schema';

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
  const [isLoading, setIsLoading] = useState(method === PUT); // Start loading if editing
  const [isCollectionLoading, setIsCollectionLoading] = useState(true);

  // Find the collection by ID or default to an empty object
  const collection = collections.find((c) => c.id === collectionId);
  const collectionPrice = collection ? parseNumeric(collection.price) : 0;
  const minBidPrice = collectionPrice + 0.01;

  // Check if collection data is available
  useEffect(() => {
    if (collectionId && collections.length > 0) {
      const foundCollection = collections.find((c) => c.id === collectionId);
      if (foundCollection) {
        setIsCollectionLoading(false);
      }
    } else if (collectionId && collections.length === 0) {
      // If we have a collectionId but no collections loaded yet, keep loading
      setIsCollectionLoading(true);
    }
  }, [collectionId, collections]);

  const dynamicFormSchema = z.object({
    price: z
      .number()
      .min(minBidPrice, `Bid must be greater than current price $${formatPrice(minBidPrice)}`),
  });

  const form = useForm<z.infer<typeof dynamicFormSchema>>({
    resolver: zodResolver(dynamicFormSchema),
    defaultValues: {
      price: undefined,
    },
  });

  useEffect(() => {
    if (method === PUT && bidId) {
      setIsLoading(true);

      // Simulate loading time for better UX
      const timer = setTimeout(() => {
        const bidToEdit = bids.find((bid) => bid.id === bidId);
        if (bidToEdit) {
          form.reset({
            price: parseNumeric(bidToEdit.price),
          });
        }
        setIsLoading(false);
      }, 300); // Small delay to show skeleton

      return () => clearTimeout(timer);
    }
  }, [bidId, method, bids, form]);

  const formTitle = method === POST ? 'Place Your Bid' : `Edit Bid #${bidId}`;
  const formDescription =
    method === POST
      ? 'Enter your bid amount to compete for this collection'
      : 'Update your bid amount below';

  if (!user) {
    return (
      <Card className="max-w-md mx-auto bg-zinc-900 border-slate-700">
        <CardContent className="text-center py-8">
          <p className="text-slate-400">Please log in to place a bid.</p>
        </CardContent>
      </Card>
    );
  }

  if (!collectionId) {
    return (
      <Card className="max-w-md mx-auto bg-zinc-900 border-slate-700">
        <CardContent className="text-center py-8">
          <p className="text-slate-400">No collection selected.</p>
        </CardContent>
      </Card>
    );
  }

  if (!user.id) {
    return (
      <Card className="max-w-md mx-auto bg-zinc-900 border-slate-700">
        <CardContent className="text-center py-8">
          <p className="text-slate-400">User ID is not available.</p>
        </CardContent>
      </Card>
    );
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

    const response = await fetch(
      method === PUT ? `/api/bids?bid_id=${bidId}&collection_id=${collectionId}` : '/api/bids',
      {
        method,
        headers: {
          'Content-Type': CONTENT_TYPE_JSON,
        },
        body: JSON.stringify(data),
      },
    );

    if (response.ok) {
      // Only parse JSON if response has content and is not 204
      let updatedBids = null;
      if (response.status !== 204) {
        try {
          updatedBids = await response.json();
        } catch {
          // If JSON parsing fails, ignore and continue
        }
      }

      if (updatedBids) {
        setBids(updatedBids);
      } else {
        // If no updated bids in response, fetch the latest bids for this collection
        try {
          const bidsResponse = await fetch(`/api/bids?collection_id=${collectionId}`);
          if (bidsResponse.ok) {
            const latestBids = await bidsResponse.json();
            setBids(latestBids);

            // If we're editing, update the form with the latest bid data
            if (method === PUT && bidId) {
              const updatedBid = latestBids.find((bid: Bid) => bid.id === bidId);
              if (updatedBid) {
                form.reset({
                  price: parseNumeric(updatedBid.price),
                });
              }
            }
          }
        } catch (error) {
          console.warn('Failed to fetch updated bids:', error);
        }
      }

      if (method === POST) {
        toast.success('Bid placed successfully!', {
          description: 'Your bid has been recorded and is awaiting review.',
          duration: 5000,
          action: {
            label: 'View Collections',
            onClick: () => (window.location.href = `/collections/${collectionId}`),
          },
        });
      } else {
        toast.success('Bid updated successfully!', {
          description: 'Your bid details have been updated.',
          duration: 3000,
          action: {
            label: 'View Bids',
            onClick: () => (window.location.href = `/bids/${bidId}`),
          },
        });
      }

      fetchCollections();

      if (onSuccess) {
        onSuccess();
      }
      if (closeDialog) {
        // Add a small delay to ensure the user sees the success message
        setTimeout(() => {
          closeDialog();
        }, 1500);
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
    <div className="w-full">
      <Card className="border-0 shadow-xl bg-zinc-900 text-white">
        <CardHeader className="pb-4 bg-zinc-900">
          {isLoading || isCollectionLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="p-2 bg-emerald-500/20 rounded-lg h-9 w-9" />
              <div>
                <Skeleton className="h-6 w-32 mb-2 bg-slate-600/70" />
                <Skeleton className="h-4 w-48 bg-slate-700/70" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/20 rounded-lg">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-white">{formTitle}</CardTitle>
                <CardDescription className="text-sm text-slate-400">
                  {formDescription}
                </CardDescription>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0 bg-zinc-900">
          {isLoading || isCollectionLoading ? (
            <BidFormSkeleton closeDialog={closeDialog} />
          ) : (
            <>
              {/* Collection Context */}
              <div className="mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-400">Current Price</p>
                    <p className="text-2xl font-bold text-white">{formatPrice(collectionPrice)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-400">Minimum Bid</p>
                    <p className="text-lg font-semibold text-emerald-400">
                      {formatPrice(minBidPrice)}
                    </p>
                  </div>
                </div>
              </div>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center gap-2 text-white">
                          <TrendingUp className="h-4 w-4 text-emerald-400" />
                          Your Bid Amount
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 font-semibold">
                              $
                            </div>
                            <Input
                              className="pl-8 text-xl font-semibold h-14 border-2 border-slate-600 bg-slate-800 text-white focus:border-emerald-500 focus:ring-emerald-500/20 transition-colors placeholder:text-slate-500"
                              placeholder="0.00"
                              type="number"
                              step="0.01"
                              min={minBidPrice}
                              max="1000000"
                              autoComplete="off"
                              {...field}
                              value={field.value ?? ''}
                              onChange={(e) => {
                                const value = e.target.value;
                                if (value === '') {
                                  field.onChange('');
                                  return;
                                }
                                const numValue = parseFloat(value);
                                if (!Number.isNaN(numValue)) {
                                  field.onChange(numValue);
                                }
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-sm text-slate-400">
                          Enter an amount greater than ${minBidPrice.toLocaleString()} to place your
                          bid
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-3 pt-4">
                    {closeDialog && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={closeDialog}
                        className="flex-1 h-12 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                        disabled={form.formState.isSubmitting}
                      >
                        Cancel
                      </Button>
                    )}
                    <Button
                      type="submit"
                      disabled={!form.formState.isValid || form.formState.isSubmitting}
                      className="flex-1 h-12 font-semibold text-base bg-emerald-600 hover:bg-emerald-700 text-white border-0 transition-colors disabled:bg-slate-700 disabled:text-slate-400"
                      aria-label={method === POST ? 'Create Bid' : 'Save Changes'}
                    >
                      {form.formState.isSubmitting && (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {method === POST ? 'Place Bid' : 'Update Bid'}
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
BidForm.displayName = 'BidForm';
