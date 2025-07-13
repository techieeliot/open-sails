'use client';

import { useAtomValue, useSetAtom } from 'jotai';
import { collectionsAtom, userSessionAtom } from '@/lib/atoms';
import { Collection } from '@/types';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  FluidFormElement,
  Form,
  FormControl,
  FormDescription,
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
import { formSchema } from './schema';
import { API_ENDPOINTS, POST, PUT } from '@/lib/constants';
import { Loader } from 'lucide-react';

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
  const router = useRouter();

  const submitButtonText = method === POST ? 'Create Collection' : 'Save Changes';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      descriptions: '',
      price: undefined,
      stocks: undefined,
    },
    mode: 'onBlur', // Validate fields when they lose focus
    criteriaMode: 'all', // Show all validation errors
  });

  useEffect(() => {
    if (method === PUT && collectionId) {
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

    if (method === POST) {
      if (user) {
        data.ownerId = user.id;
      }
      data.createdAt = new Date().toISOString();
    } else if (method === PUT) {
      data.id = collectionId;
    }

    const response = await fetch(
      method === PUT ? `/api/collections/${collectionId}` : API_ENDPOINTS.collections,
      {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      },
    );

    if (response.ok) {
      const updatedItem = await response.json();
      if (method === POST) {
        setCollections((prev) => [updatedItem, ...prev]);

        // Show success toast and navigate to the new collection page
        toast.success('Collection created successfully! Let the bidding begin.', {
          duration: 5000,
        });

        // Close dialog if provided
        if (closeDialog) closeDialog();

        // Navigate to the new collection page
        router.push(`/collections/${updatedItem.id}`);
      } else {
        setCollections((prev) => prev.map((c) => (c.id === collectionId ? updatedItem : c)));

        // Show success toast for updates
        toast.success('Collection updated successfully!', {
          duration: 3000,
        });

        if (onSuccess) onSuccess();
        if (closeDialog) closeDialog();
      }
    } else {
      console.error('Failed to process collection');
      toast.error('Failed to process collection. Please try again.', {
        duration: 5000,
      });
    }
  };

  return (
    <Form {...form}>
      <FluidFormElement onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 p-4">
        <div className="flex flex-col max-h-[50vh] overflow-y-auto">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Collection Name</FormLabel>
                <FormDescription className="text-xs text-muted-foreground mt-1">
                  2-100 characters, letters, numbers, spaces, hyphens, parentheses, and underscores
                  only
                </FormDescription>
                <FormControl>
                  <Input
                    placeholder="e.g., Antminer S19 Pro"
                    maxLength={100}
                    autoComplete="off"
                    {...field}
                    value={field.value ?? ''}
                    onBlur={() => {
                      field.onBlur(); // Trigger validation
                      form.trigger('name'); // Explicitly trigger validation
                    }}
                    aria-invalid={!!form.formState.errors.name}
                    aria-describedby={form.formState.errors.name ? 'name-error' : undefined}
                  />
                </FormControl>
                <FormMessage id="name-error" aria-live="polite" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descriptions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormDescription className="text-xs text-muted-foreground mt-1">
                  {field.value?.length || 0}/1000 characters (minimum 10 required)
                </FormDescription>
                <FormControl>
                  <Textarea
                    placeholder="Describe your mining hardware collection in detail..."
                    maxLength={1000}
                    rows={4}
                    autoComplete="off"
                    {...field}
                    onBlur={() => {
                      field.onBlur();
                      form.trigger('descriptions'); // Explicitly trigger validation
                    }}
                    aria-invalid={!!form.formState.errors.descriptions}
                    aria-describedby={
                      form.formState.errors.descriptions ? 'descriptions-error' : undefined
                    }
                  />
                </FormControl>
                <FormMessage id="descriptions-error" aria-live="polite" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Starting Price ($)</FormLabel>
                <FormDescription className="text-xs text-muted-foreground mt-1">
                  Minimum $0.01, maximum $1,000,000 (up to 2 decimal places)
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
                      if (value === '') {
                        field.onChange('');
                        return;
                      }
                      const numValue = parseFloat(value);
                      if (!isNaN(numValue)) {
                        field.onChange(numValue);
                      }
                    }}
                    onBlur={() => {
                      field.onBlur();
                      form.trigger('price'); // Explicitly trigger validation
                    }}
                    aria-invalid={!!form.formState.errors.price}
                    aria-describedby={form.formState.errors.price ? 'price-error' : undefined}
                  />
                </FormControl>
                <FormMessage id="price-error" aria-live="polite" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="stocks"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock Quantity</FormLabel>
                <FormDescription className="text-xs text-muted-foreground mt-1">
                  Number of units available (1-10,000 whole numbers only)
                </FormDescription>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="1"
                    min="1"
                    max="10000"
                    step="1"
                    autoComplete="off"
                    {...field}
                    value={field.value ?? ''}
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
                    onBlur={() => {
                      field.onBlur();
                      form.trigger('stocks'); // Explicitly trigger validation
                    }}
                    aria-invalid={!!form.formState.errors.stocks}
                    aria-describedby={form.formState.errors.stocks ? 'stocks-error' : undefined}
                  />
                </FormControl>
                <FormMessage id="stocks-error" aria-live="polite" />
              </FormItem>
            )}
          />
        </div>
        <div className="pt-4">
          <Button
            type="submit"
            className="w-full flex items-center justify-center"
            variant="secondary"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
            aria-busy={form.formState.isSubmitting}
            aria-label={submitButtonText}
          >
            {form.formState.isSubmitting ? (
              <Loader
                className="animate-spin mr-2 h-4 w-4 text-zinc-900 dark:text-zinc-200"
                aria-hidden="true"
                focusable="false"
              />
            ) : (
              submitButtonText
            )}
          </Button>
        </div>
      </FluidFormElement>
    </Form>
  );
};
