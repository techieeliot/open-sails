'use client';

import { formatDistanceToNow } from 'date-fns';
import { useAtomValue } from 'jotai';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import BidsTable from '@/app/dashboard/components/collections-index/components/bids-table';
import DeleteCollectionDialog from '@/app/dashboard/components/delete-collection-dialog';
import LoadingIndicator from '@/components/bid-details/components/loading';
import EditCollectionDialog from '@/components/edic-collection-dialog';
import PageWrapper from '@/components/page-wrapper';
import {
  Card,
  CardAction,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { sortedCollectionsAtom, userLoginStatusAtom, userSessionAtom } from '@/lib/atoms';
import { parseNumeric } from '@/lib/utils';
import { Collection, User } from '@/types';
import GoBackButton from '@/components/go-back-button.tsx';

export default function CollectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const userSession = useAtomValue(userSessionAtom);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const collections = useAtomValue(sortedCollectionsAtom);
  const isLoggedIn = useAtomValue(userLoginStatusAtom);

  // Parse the collection ID from URL params and handle invalid IDs
  const collectionIdParam = params?.id;
  const isValidIdParam = typeof collectionIdParam === 'string' && /^\d+$/.test(collectionIdParam);
  const collectionId: number = isValidIdParam ? parseNumeric(collectionIdParam) : 0;

  // Redirect if ID is invalid
  useEffect(() => {
    if (!isValidIdParam || collectionId === 0) {
      toast.error('Invalid collection ID', {
        description: 'Redirecting to dashboard',
      });
      router.push('/dashboard');
    }
  }, [collectionIdParam, collectionId, router]);

  const { user } = userSession;
  const isOwnerOfCollection =
    (isLoggedIn && collection && user && user.id === collection.ownerId) ?? false;

  useEffect(() => {
    const fetchCollectionDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch the collection details
        const response = await fetch(`/api/collections/${collectionId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch collection details');
        }

        const collectionData = await response.json();
        setCollection(collectionData);

        // Fetch owner details
        if (collectionData.ownerId) {
          const userResponse = await fetch(`/api/users?id=${collectionData.ownerId}`);
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setOwner(userData);
          }
        }
      } catch (error) {
        console.error('Error fetching collection details:', error);
        setError('Failed to fetch collection details. Please try again later.');
        toast.error('Failed to load collection details', {
          description: 'Please try again later',
        });
      } finally {
        setIsLoading(false);
      }
    };
    // Only fetch if the collection ID is valid
    if (collectionId && isValidIdParam) {
      fetchCollectionDetails();
    }
  }, [collectionId]);

  return (
    <PageWrapper>
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <>
          {collection ? (
            <>
              <div className="flex flex-col justify-between mb-4 gap-2 px-2 sm:px-0">
                <GoBackButton variant="link" icon={ArrowLeft} />
              </div>
              <Card className="p-4 sm:p-6 mb-6 w-full max-w-lg mx-auto sm:max-w-4xl">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold mb-2 sm:mb-4 text-center sm:text-left">
                    <h1>{collection.name}</h1>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-8 sm:grid sm:grid-cols-2">
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
                      <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
                        Collection Information
                      </h2>
                    </CardTitle>
                    <CardContent className="space-y-2">
                      <p>
                        <span className="font-semibold">ID:</span> {collection.id}
                      </p>
                      <p>
                        <span className="font-semibold">Status:</span>{' '}
                        <span className="capitalize">{collection.status}</span>
                      </p>
                      <p>
                        <span className="font-semibold">Price:</span> $
                        {collection.price?.toLocaleString()}
                      </p>
                      <p>
                        <span className="font-semibold">Available Stock:</span> {collection.stocks}{' '}
                        units
                      </p>
                      <p>
                        <span className="font-semibold">Created:</span>{' '}
                        {formatDistanceToNow(collection.createdAt, { addSuffix: true })}
                      </p>
                      <p>
                        <span className="font-semibold">Updated:</span>{' '}
                        {formatDistanceToNow(collection.updatedAt, { addSuffix: true })}
                      </p>
                      {collection.descriptions && (
                        <p>
                          <span className="font-semibold">Description:</span>{' '}
                          <span className="whitespace-pre-wrap max-w-sm">
                            {collection.descriptions}
                          </span>
                        </p>
                      )}
                    </CardContent>
                  </div>
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
                      <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4">
                        Owner Information
                      </h2>
                    </CardTitle>
                    <CardContent className="space-y-2">
                      {owner ? (
                        <>
                          <p>
                            <span className="font-semibold">Name:</span> {owner.name}
                          </p>
                          <p>
                            <span className="font-semibold">Email:</span> {owner.email}
                          </p>
                          <p>
                            <span className="font-semibold">Role:</span>{' '}
                            <span className="capitalize"></span>
                          </p>
                        </>
                      ) : (
                        <p className="text-gray-600">Owner details unavailable</p>
                      )}
                    </CardContent>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2 sm:gap-0 sm:flex-row">
                  {collection.status === 'open' && isOwnerOfCollection && (
                    <CardAction className="flex flex-col sm:flex-row w-full gap-6">
                      <EditCollectionDialog
                        key={`edit-dialog-${collectionId}`}
                        collectionId={collectionId}
                        onSuccess={() => {
                          // Refetch collection details after update
                          if (collectionId) {
                            setIsLoading(true);
                            fetch(`/api/collections/${collectionId}`)
                              .then((response) => response.json())
                              .then((data) => {
                                setCollection(data);
                                toast.success('Collection updated successfully');
                              })
                              .catch(() => {
                                /* handle error */
                              })
                              .finally(() => setIsLoading(false));
                          }
                        }}
                      />
                      <DeleteCollectionDialog
                        key={`delete-dialog-${collectionId}`}
                        collectionId={collectionId}
                        onSuccess={() => {
                          // Redirect to dashboard after deletion
                          router.push('/dashboard');
                          toast.success('Collection deleted successfully');
                        }}
                      />
                    </CardAction>
                  )}
                </CardFooter>
              </Card>

              <Card className="p-4 sm:p-6 mb-6 w-full max-w-lg mx-auto sm:max-w-4xl">
                <h2 className="text-lg sm:text-xl font-semibold mb-4">Bids for this Collection</h2>

                {/* BidsTable component with hasPlaceBidButton prop */}
                <BidsTable
                  collection={collections.find((c) => c.id === collectionId) as Collection}
                  showPlaceBidButtonAtTop={
                    isLoggedIn && !isOwnerOfCollection && collection.status === 'open'
                  }
                />
              </Card>
            </>
          ) : (
            <Card className="flex flex-col items-center justify-center min-h-[300px] p-4 sm:p-8">
              <h1 className="text-2xl font-bold mb-4 text-center">Collection Not Found</h1>
              <p className="text-gray-600 mb-4 text-center">
                {error ||
                  "The collection you're looking for doesn't exist or may have been removed."}
              </p>
              <GoBackButton size="sm" variant="link" />
            </Card>
          )}
        </>
      )}
    </PageWrapper>
  );
}
