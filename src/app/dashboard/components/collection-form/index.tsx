'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useAtomValue, useSetAtom } from 'jotai';
import { Loader, Package, DollarSign, Hash, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import type * as z from 'zod';

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
import { Textarea } from '@/components/ui/textarea';
import { useFetchCollections } from '@/hooks/useFetchCollections';
import { collectionsAtom, userSessionAtom } from '@/lib/atoms';
import { API_ENDPOINTS, POST, PUT } from '@/lib/constants';
import { parseNumeric } from '@/lib/utils';
import type { Collection } from '@/types';

import { formSchema } from './schema';

/**
 * Props for the CollectionForm component
 * @interface CollectionFormProps
 * @property {string} method - HTTP method for form submission ('POST' or 'PUT')
 * @property {number} [collectionId] - ID of the collection to edit (required for PUT)
 * @property {() => void} [onSuccess] - Callback function to execute on successful submission
 * @property {() => void} [closeDialog] - Function to close the parent dialog
 */
export interface CollectionFormProps {
  method: 'POST' | 'PUT';
  collectionId?: number;
  onSuccess?: () => void;
  closeDialog?: () => void;
}

/**
 * Form component for creating or editing a mining hardware collection
 *
 * Handles form validation, submission, and API interaction for collection data.
 * Displays appropriate form fields with validation and feedback.
 *
 * @param {CollectionFormProps} props - Component props
 * @returns {JSX.Element} Rendered form component
 */
export const CollectionForm = ({
  method,
  collectionId,
  onSuccess,
  closeDialog,
}: CollectionFormProps) => {
  const userSession = useAtomValue(userSessionAtom);
  const isLoggedIn = userSession.user;
  const setCollections = useSetAtom(collectionsAtom);
  const router = useRouter();
  const fetchCollections = useFetchCollections();
  const [isLoading, setIsLoading] = useState(method === PUT); // Start loading if editing

  const formTitle = method === POST ? 'Create New Collection' : `Edit Collection #${collectionId}`;
  const formDescription =
    method === POST
      ? 'List your mining hardware collection for bidding'
      : 'Update your collection details below';
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
        setIsLoading(true);
        try {
          const response = await fetch(`/api/collections/${collectionId}`);
          if (response.ok) {
            const data: Collection = await response.json();
            form.reset({
              name: data.name,
              descriptions: data.descriptions || '',
              price: parseNumeric(data.price),
              stocks: data.stocks,
            });
          }
        } catch (error) {
          console.error('Failed to fetch collection data:', error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchCollectionData();
    }
  }, [collectionId, method, form]);

  const handleSubmit = async (values: z.infer<typeof formSchema>) => {
    const data: Partial<Collection> = {
      ...values,
      price: String(values.price).replace(/,/g, ''),
      updatedAt: new Date().toISOString(),
    };

    if (method === POST) {
      if (isLoggedIn) {
        data.ownerId = isLoggedIn.id;
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
      let updatedItem: unknown = null;
      // Only parse JSON if not 204 and has content
      if (response.status !== 204) {
        try {
          updatedItem = await response.json();
        } catch {
          // If no content, ignore
        }
      }
      if (method === POST) {
        if (
          updatedItem &&
          typeof updatedItem === 'object' &&
          updatedItem !== null &&
          'id' in updatedItem
        ) {
          setCollections((prev) => [updatedItem as Collection, ...prev]);
          router.push(`/collections/${(updatedItem as Collection).id}`);
        }
        toast.success('Collection created successfully! Let the bidding begin.', {
          duration: 5000,
        });
        if (closeDialog) closeDialog();
      } else {
        if (
          updatedItem &&
          typeof updatedItem === 'object' &&
          updatedItem !== null &&
          'id' in updatedItem
        ) {
          setCollections((prev) =>
            prev.map((c) => (c.id === collectionId ? (updatedItem as Collection) : c)),
          );
        }
        toast.success('Collection updated successfully!', {
          duration: 3000,
        });
        fetchCollections();
        if (onSuccess) onSuccess();
        if (closeDialog) closeDialog();
      }
    } else {
      let errorMsg = 'Failed to process collection.';
      try {
        const errJson = await response.json();
        if (errJson && errJson.error) errorMsg = errJson.error;
      } catch {}
      console.error('Failed to process collection');
      toast.error(errorMsg + ' Please try again.', {
        duration: 5000,
      });
    }
  };

  // Skeleton loading component for form fields
  const FormFieldSkeleton = ({
    hasIcon = false,
    isTextarea = false,
    isGridLayout = false,
  }: {
    hasIcon?: boolean;
    isTextarea?: boolean;
    isGridLayout?: boolean;
  }) => (
    <div className={isGridLayout ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
      {isGridLayout ? (
        <>
          {/* Price Field Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-24" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-32" />
          </div>
          {/* Stock Field Skeleton */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-5 w-28" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-4 w-24" />
          </div>
        </>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {hasIcon && <Skeleton className="h-4 w-4" />}
            <Skeleton className="h-5 w-32" />
          </div>
          <Skeleton className={`w-full ${isTextarea ? 'h-[120px]' : 'h-12'}`} />
          <div className={isTextarea ? 'flex justify-between' : ''}>
            <Skeleton className="h-4 w-48" />
            {isTextarea && <Skeleton className="h-4 w-20" />}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          {isLoading ? (
            <div className="flex items-center gap-3">
              <Skeleton className="p-2 bg-primary/10 rounded-lg h-9 w-9" />
              <div>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold">{formTitle}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {formDescription}
                </CardDescription>
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          {isLoading ? (
            // Skeleton loading state
            <div className="space-y-6">
              {/* Collection Name Skeleton */}
              <FormFieldSkeleton hasIcon />

              {/* Description Skeleton */}
              <FormFieldSkeleton hasIcon isTextarea />

              {/* Price and Stock Skeleton */}
              <FormFieldSkeleton isGridLayout />

              {/* Submit Button Skeleton */}
              <div className="flex gap-3 pt-6">
                {closeDialog && <Skeleton className="flex-1 h-12" />}
                <Skeleton className="flex-1 h-12" />
              </div>
            </div>
          ) : (
            // Actual form content
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Collection Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <Package className="h-4 w-4 text-primary" />
                        Collection Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="h-12 text-base border-2 focus:border-primary transition-colors"
                          placeholder="e.g., Antminer S19 Pro Collection"
                          maxLength={100}
                          autoComplete="off"
                          {...field}
                          value={field.value ?? ''}
                          onBlur={() => {
                            field.onBlur();
                            form.trigger('name');
                          }}
                          aria-invalid={!!form.formState.errors.name}
                          aria-describedby={form.formState.errors.name ? 'name-error' : undefined}
                        />
                      </FormControl>
                      <FormDescription className="text-sm">
                        2-100 characters, letters, numbers, and basic punctuation
                      </FormDescription>
                      <FormMessage id="name-error" aria-live="polite" />
                    </FormItem>
                  )}
                />

                {/* Description */}
                <FormField
                  control={form.control}
                  name="descriptions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="min-h-[120px] text-base border-2 focus:border-primary transition-colors resize-none"
                          placeholder="Describe your mining hardware collection in detail... Include specifications, condition, and any notable features."
                          maxLength={1000}
                          autoComplete="off"
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            form.trigger('descriptions');
                          }}
                          aria-invalid={!!form.formState.errors.descriptions}
                          aria-describedby={
                            form.formState.errors.descriptions ? 'descriptions-error' : undefined
                          }
                        />
                      </FormControl>
                      <FormDescription className="text-sm flex justify-between">
                        <span>Minimum 10 characters required</span>
                        <span className="text-muted-foreground">
                          {field.value?.length || 0}/1000 characters
                        </span>
                      </FormDescription>
                      <FormMessage id="descriptions-error" aria-live="polite" />
                    </FormItem>
                  )}
                />

                {/* Price and Stock Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Starting Price */}
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-primary" />
                          Starting Price
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                              $
                            </div>
                            <Input
                              className="pl-8 h-12 text-lg font-semibold border-2 focus:border-primary transition-colors"
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
                                form.trigger('price');
                              }}
                              aria-invalid={!!form.formState.errors.price}
                              aria-describedby={
                                form.formState.errors.price ? 'price-error' : undefined
                              }
                            />
                          </div>
                        </FormControl>
                        <FormDescription className="text-sm">$0.01 - $1,000,000</FormDescription>
                        <FormMessage id="price-error" aria-live="polite" />
                      </FormItem>
                    )}
                  />

                  {/* Stock Quantity */}
                  <FormField
                    control={form.control}
                    name="stocks"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-semibold flex items-center gap-2">
                          <Hash className="h-4 w-4 text-primary" />
                          Stock Quantity
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="h-12 text-lg font-semibold border-2 focus:border-primary transition-colors"
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
                              form.trigger('stocks');
                            }}
                            aria-invalid={!!form.formState.errors.stocks}
                            aria-describedby={
                              form.formState.errors.stocks ? 'stocks-error' : undefined
                            }
                          />
                        </FormControl>
                        <FormDescription className="text-sm">1 - 10,000 units</FormDescription>
                        <FormMessage id="stocks-error" aria-live="polite" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Submit Button */}
                <div className="flex gap-3 pt-6">
                  {closeDialog && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={closeDialog}
                      className="flex-1 h-12"
                      disabled={form.formState.isSubmitting}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button
                    type="submit"
                    className="flex-1 h-12 font-semibold text-base"
                    disabled={!form.formState.isValid || form.formState.isSubmitting}
                    aria-label={submitButtonText}
                  >
                    {form.formState.isSubmitting && (
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {submitButtonText}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
