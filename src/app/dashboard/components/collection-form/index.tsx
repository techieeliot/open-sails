'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { collectionsAtom, userSessionAtom } from '@/lib/atoms';
import { Collection } from '@/types';
import { useEffect } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      'Name can only contain letters, numbers, spaces, hyphens, and underscores',
    ),
  descriptions: z
    .string()
    .min(1, 'Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  price: z.coerce
    .number({
      required_error: 'Price is required',
      invalid_type_error: 'Price must be a valid number',
    })
    .positive({ message: 'Price must be a positive number' })
    .min(0.01, { message: 'Price must be at least $0.01' })
    .max(1000000, { message: 'Price cannot exceed $1,000,000' })
    .refine(
      (val) => {
        // Check if number has at most 2 decimal places
        const decimals = val.toString().split('.')[1];
        return !decimals || decimals.length <= 2;
      },
      { message: 'Price can have at most 2 decimal places' },
    ),
  stocks: z.coerce
    .number({
      required_error: 'Stock quantity is required',
      invalid_type_error: 'Stock quantity must be a valid number',
    })
    .int({ message: 'Stock quantity must be a whole number' })
    .positive({ message: 'Stock quantity must be a positive number' })
    .min(1, { message: 'Stock quantity must be at least 1' })
    .max(10000, { message: 'Stock quantity cannot exceed 10,000 units' }),
});

export interface CollectionFormProps {
  method: 'POST' | 'PUT';
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
  const { user } = useAtomValue(userSessionAtom);
  const setCollections = useSetAtom(collectionsAtom);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      descriptions: '',
      price: undefined, // Changed from 0 to undefined to show placeholder
      stocks: undefined, // Changed from 0 to undefined to show placeholder
    },
  });

  useEffect(() => {
    if (method === 'PUT' && collectionId) {
      const fetchCollectionData = async () => {
        const response = await fetch(`/api/collections/${collectionId}`);
        if (response.ok) {
          const data: Collection = await response.json();
          form.reset({
            name: data.name,
            descriptions: data.descriptions || '',
            price: data.price,
            stocks: data.stocks,
          });
        }
      };
      fetchCollectionData();
    }
  }, [collectionId, method, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const data: Partial<Collection> = {
      ...values,
      updatedAt: new Date().toISOString(),
    };

    if (method === 'POST') {
      if (user) {
        data.ownerId = user.id;
      }
      data.createdAt = new Date().toISOString();
    } else if (method === 'PUT') {
      data.id = collectionId;
    }

    const response = await fetch('/api/collections', {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const updatedItem = await response.json();
      if (method === 'POST') {
        setCollections((prev) => [...prev, updatedItem]);
      } else {
        setCollections((prev) => prev.map((c) => (c.id === collectionId ? updatedItem : c)));
      }
      if (onSuccess) onSuccess();
      if (closeDialog) closeDialog();
    } else {
      console.error('Failed to process collection');
      alert('Failed to process collection. Check console for details.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Collection Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Antminer S19 Pro" maxLength={100} {...field} />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                2-100 characters, letters, numbers, spaces, hyphens, and underscores only
              </p>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="descriptions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe your mining hardware collection in detail..."
                  maxLength={1000}
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                {field.value?.length || 0}/1000 characters (minimum 10 required)
              </p>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Starting Price ($)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  min="0.01"
                  max="1000000"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      field.onChange('');
                      return;
                    }
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      field.onChange(numValue);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                Minimum $0.01, maximum $1,000,000 (up to 2 decimal places)
              </p>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stocks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stock Quantity</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="1"
                  min="1"
                  max="10000"
                  step="1"
                  {...field}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      field.onChange('');
                      return;
                    }
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                      field.onChange(numValue);
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
              <p className="text-xs text-muted-foreground mt-1">
                Number of units available (1-10,000 whole numbers only)
              </p>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="w-full"
          disabled={!form.formState.isValid || form.formState.isSubmitting}
        >
          {form.formState.isSubmitting
            ? method === 'POST'
              ? 'Creating...'
              : 'Saving...'
            : method === 'POST'
              ? 'Create Collection'
              : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
};
