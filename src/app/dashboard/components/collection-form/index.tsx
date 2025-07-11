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
  name: z.string().min(1, 'Name is required'),
  descriptions: z.string().min(1, 'Description is required'),
  price: z.coerce.number().min(1, 'Price must be a positive number'),
  stocks: z.coerce.number().int().min(1, 'Stocks must be a positive integer'),
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
      price: 0,
      stocks: 0,
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
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter collection name" {...field} />
              </FormControl>
              <FormMessage />
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
                <Textarea placeholder="Enter collection description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="price"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter price" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="stocks"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Stocks</FormLabel>
              <FormControl>
                <Input type="number" placeholder="Enter stock quantity" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">
          {method === 'POST' ? 'Create Collection' : 'Save Changes'}
        </Button>
      </form>
    </Form>
  );
};
