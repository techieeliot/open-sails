'use client';

import PageWrapper from '@/components/page-wrapper';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useAtomValue } from 'jotai';
import { userSessionAtom } from '@/lib/atoms';
import { Collection, User } from '@/types';
import { BidList } from '@/app/dashboard/components/bids-list';
import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { API_ENDPOINTS, CONTENT_TYPE_JSON, DELETE } from '@/lib/constants';
import { Bitcoin } from 'lucide-react';

export function CollectionDetailsClient() {
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
        const response = await fetch(`${API_ENDPOINTS.collections}/${collectionId}`);
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

  const handleBack = () => {
    router.back();
  };

  const handleDeleteCollection = async () => {
    try {
      const response = await fetch(`/api/collections/${collectionId}`, {
        method: DELETE,
        headers: {
          'Content-Type': CONTENT_TYPE_JSON,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to delete collection');
      }

      toast.success('Collection deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection', {
        description: error instanceof Error ? error.message : 'Please try again later',
      });
    }
  };

  const handleEditCollection = () => {
    router.push(`/dashboard?edit=${collectionId}`);
  };

  const isOwnerOfCollection = !!(user && collection && user.id === collection.ownerId);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="flex justify-center items-center min-h-[300px]">
          <p className="text-gray-600">
            <Bitcoin className="animate-pulse" height={300} width={300} />
          </p>
        </div>
      </PageWrapper>
    );
  }

  if (error || !collection) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center min-h-[300px]">
          <h1 className="text-2xl font-bold mb-4">Collection Not Found</h1>
          <p className="text-gray-600 mb-4">
            {error || "The collection you're looking for doesn't exist or may have been removed."}
          </p>
          <Button onClick={handleBack}>Go Back</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="flex flex-col justify-between mb-6 gap-2">
        <Link href="/dashboard">
          <Button variant="outline" size="sm">
            Back to Dashboard
          </Button>
        </Link>
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
                <span className="font-semibold">Price:</span> ${collection.price?.toLocaleString()}
              </p>
              <p>
                <span className="font-semibold">Available Stock:</span> {collection.stocks} units
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
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{collection.descriptions}</p>
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
          {isOwnerOfCollection && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleEditCollection}>
                Edit Collection
              </Button>
              <ConfirmationDialog
                triggerText="Delete Collection"
                dialogTitle="Delete Collection"
                description="Are you sure you want to delete this collection? This action cannot be undone."
                onConfirm={handleDeleteCollection}
              />
            </div>
          )}{' '}
          {user && !isOwnerOfCollection && (
            <div className="flex">
              <DynamicInputDialog
                className="bg-zinc-900"
                triggerText="Place Bid"
                dialogTitle="Place a Bid"
                description="Fill out the form to place a bid on this collection."
                modalCategory="bid"
                method="POST"
                collectionId={collectionId}
              />
            </div>
          )}
        </div>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Bids for this Collection</h2>
      <BidList collectionId={collectionId} isOwner={isOwnerOfCollection} />
    </PageWrapper>
  );
}
