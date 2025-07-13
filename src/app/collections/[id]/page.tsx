'use client';

import PageWrapper from '@/components/page-wrapper';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai';
import { userSessionAtom } from '@/lib/atoms';
import { Collection, User } from '@/types';
import { BidList } from '@/app/dashboard/components/bids-list';
import { Bitcoin } from 'lucide-react';
import PlaceBidDialog from '@/components/place-bid-dialog';
import DeleteCollectionDialog from '@/app/dashboard/components/delete-collection-dialog';
import EditCollectionDialog from '@/components/edic-collection-dialog';
import GoBackButton from '@/components/go-back-button.tsx';

export default function CollectionDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAtomValue(userSessionAtom);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [owner, setOwner] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const collectionId = Number(params.id);

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

    if (collectionId) {
      fetchCollectionDetails();
    }
  }, [collectionId]);

  const isOwnerOfCollection = !!(user && collection && user.id === collection.ownerId);

  return (
    <PageWrapper>
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-gray-600">
            <Bitcoin className="animate-pulse" height={300} width={300} />
          </p>
        </div>
      ) : (
        <>
          {collection ? (
            <>
              <div className="flex flex-col justify-between mb-6 gap-2">
                <GoBackButton variant="link" />
              </div>
              <Card className="p-6 mb-6">
                <h1 className="text-2xl font-bold mb-4">{collection.name}</h1>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Collection Information</h2>
                    <div className="space-y-2">
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
                        {new Date(collection.createdAt).toLocaleString()}
                      </p>
                      <p>
                        <span className="font-semibold">Updated:</span>{' '}
                        {new Date(collection.updatedAt).toLocaleString()}
                      </p>
                    </div>

                    {collection.descriptions && (
                      <div className="mt-4">
                        <h3 className="flex flex-col">
                          <span className="text-lg font-semibold mb-2">Description:</span>{' '}
                          <span className="whitespace-pre-wrap max-w-sm">
                            {collection.descriptions}
                          </span>
                        </h3>
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Owner Information</h2>
                    {owner ? (
                      <div className="space-y-2">
                        <p>
                          <span className="font-semibold">Name:</span> {owner.name}
                        </p>
                        <p>
                          <span className="font-semibold">Email:</span> {owner.email}
                        </p>
                        <p>
                          <span className="font-semibold">Role:</span>{' '}
                          <span className="capitalize">{owner.role}</span>
                        </p>
                      </div>
                    ) : (
                      <p className="text-gray-600">Owner details unavailable</p>
                    )}
                  </div>

                  {collection.status === 'open' && isOwnerOfCollection && (
                    <div className="flex gap-2">
                      <EditCollectionDialog
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
                                toast.error('Error refreshing collection data');
                              })
                              .finally(() => setIsLoading(false));
                          }
                        }}
                      />
                      <DeleteCollectionDialog
                        key={`delete-dialog-${collectionId}`}
                        collectionId={collectionId}
                        onSuccess={() => {
                          router.push('/dashboard');
                        }}
                      />
                    </div>
                  )}
                </div>
              </Card>

              <h2 className="text-xl font-semibold mb-4">Bids for this Collection</h2>
              {user && !isOwnerOfCollection && collection.status === 'open' && (
                <div className="flex">
                  <PlaceBidDialog collectionId={collectionId} />
                </div>
              )}
              <BidList collectionId={collectionId} isOwner={isOwnerOfCollection} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px]">
              <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
              <p className="text-gray-600 mb-4">
                {error ||
                  "The collection you're looking for doesn't exist or may have been removed."}
              </p>
              <GoBackButton size="sm" variant="link" />
            </div>
          )}
        </>
      )}
    </PageWrapper>
  );
}
