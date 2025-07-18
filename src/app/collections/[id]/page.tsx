'use client';

import { ArrowLeft, UserIcon, Archive, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAtomValue } from 'jotai/react';
import { formatDistanceToNow } from 'date-fns';
import { useParams, useRouter } from 'next/navigation';

import { Card, CardContent, CardHeader, CardAction } from '@/components/ui/card';
import GoBackButton from '@/components/go-back-button.tsx';
import LoadingIndicator from '@/components/bid-details/components/loading';
import PageWrapper from '@/components/page-wrapper';
import { useFetchCollections } from '@/hooks/useFetchCollections';
import BidsTable from '@/app/dashboard/components/collections-index/components/bids-table';
import { bidsAtom, sortedCollectionsAtom, userLoginStatusAtom, userSessionAtom } from '@/lib/atoms';
import { formatPrice, parseNumeric } from '@/lib/utils';
import type { Collection, User } from '@/types';
import { CollectionAdminPanel } from './components/collection-management-panel.client';

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
  const fetchCollections = useFetchCollections();
  const bids = useAtomValue(bidsAtom);

  // Parse the collection ID from URL params and handle invalid IDs
  const collectionIdParam = params?.id;
  const isValidIdParam = typeof collectionIdParam === 'string' && /^\d+$/.test(collectionIdParam);
  const collectionId: number = isValidIdParam ? parseNumeric(collectionIdParam) : 0;
  const isOwnerOfCollection = isLoggedIn && userSession.user?.id === collection?.ownerId;

  // Fetch collection and owner data
  useEffect(() => {
    if (!collectionId) {
      setIsLoading(false);
      setError('Invalid collection ID');
      router.push('/dashboard');
      return;
    }
    setIsLoading(true);
    fetch(`/api/collections/${collectionId}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error || !data.id) {
          setIsLoading(false);
          setError('Collection not found');
          router.push('/dashboard');
          return;
        }
        setCollection(data);
        // Optionally fetch owner if needed
        if (data && data.ownerId) {
          fetch(`/api/users/${data.ownerId}`)
            .then((res) => res.json())
            .then((ownerData) => setOwner(ownerData))
            .catch(() => setOwner(null));
        } else {
          setOwner(null);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setError('Failed to load collection');
        setIsLoading(false);
        router.push('/dashboard');
      });
  }, [collectionId, router]);

  useEffect(() => {
    if (collections.length === 0) {
      fetchCollections();
    }
  }, [collections, fetchCollections]);

  useEffect(() => {
    if (collectionId && !isValidIdParam) {
      setError('Invalid collection ID');
      router.push('/dashboard');
    }
  }, [collectionId, isValidIdParam, router]);

  if (!isValidIdParam) {
    return (
      <PageWrapper>
        <Card className="flex min-h-[300px] flex-col items-center justify-center p-4 sm:p-8">
          <h1 className="mb-4 text-center font-bold text-2xl">Collection Not Found</h1>
          <p className="mb-4 text-center text-gray-600">
            The collection you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
          <GoBackButton size="sm" variant="link" />
        </Card>
      </PageWrapper>
    );
  }

  // Redirect if ID is invalid
  return (
    <PageWrapper>
      {isLoading ? (
        <LoadingIndicator />
      ) : collection ? (
        <div className="w-full max-w-5xl mx-auto px-2 sm:px-6 md:px-10 lg:px-16">
          {/* Header Section */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-8 mt-2">
            <div className="flex flex-col gap-3 mb-4 sm:mb-0 px-6 sm:px-0">
              <div>
                <GoBackButton variant="outline" icon={ArrowLeft} />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-white">
                  {collection.name}
                </h1>
                <div className="text-zinc-400 text-base mt-1">ID #{collection.id}</div>
              </div>
            </div>
          </div>

          {/* Info Cards Section */}
          <div className="flex flex-col gap-6 sm:flex-row sm:gap-8 mb-8">
            {/* Collection Info Card */}
            <Card className="flex-1 bg-zinc-900/80 shadow-lg border-0">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <span className="inline-flex items-center gap-2 text-lg font-semibold">
                  <span className="inline-block rounded bg-blue-900/40 p-1 px-2 text-blue-300">
                    <Archive className="h-5 w-5" />
                    Collection
                  </span>
                </span>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <span className="text-zinc-400">Price</span>
                    <span className="text-3xl font-extrabold text-white">
                      {formatPrice(parseNumeric(collection.price))}
                    </span>
                  </div>
                  <span className="capitalize px-3 py-1 rounded bg-blue-900/80 text-blue-200 text-base font-bold shadow border border-blue-800">
                    {collection.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
                  <div>
                    <span className="text-zinc-400">Stock</span>
                    <div className="font-medium">{collection.stocks} units</div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Created</span>
                    <div className="font-medium">
                      {formatDistanceToNow(collection.createdAt, { addSuffix: true })}
                    </div>
                  </div>
                  <div>
                    <span className="text-zinc-400">Updated</span>
                    <div className="font-medium">
                      {formatDistanceToNow(collection.updatedAt, { addSuffix: true })}
                    </div>
                  </div>
                </div>
                {collection.descriptions && (
                  <div className="pt-4">
                    <span className="text-zinc-400 block mb-1 font-semibold">Description</span>
                    <span className="whitespace-pre-wrap text-base text-zinc-100">
                      {collection.descriptions}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Owner Info Card */}
            <Card className="flex-1 bg-zinc-900/80 shadow-lg border-0">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <span className="inline-flex items-center gap-2 text-lg font-semibold">
                  <span className="inline-block rounded bg-green-900/40 p-1 px-2 text-green-300">
                    <UserIcon
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    Owner
                  </span>
                </span>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <span className="text-zinc-400 mb-1 font-semibold">Name</span>
                    {owner || isOwnerOfCollection ? (
                      <div>{owner?.name ?? 'Loading...'}</div>
                    ) : (
                      <div className="text-gray-600">
                        <Loader2 className="animate-spin h-5 w-5 inline-block mr-2" />
                      </div>
                    )}
                  </div>

                  <div>
                    <span className="text-zinc-400 mb-1 font-semibold block">Role</span>
                    {owner || isOwnerOfCollection ? (
                      <span className="capitalize px-3 py-1 rounded bg-green-900/40 text-green-300 text-base font-bold shadow border border-green-800">
                        {owner?.role ?? 'Loading...'}
                      </span>
                    ) : (
                      <div className="text-gray-600">
                        <Loader2 className="animate-spin h-5 w-5 inline-block mr-2" />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              {/* Management Panel (only for owner) */}
              {collection.status === 'open' && isOwnerOfCollection && (
                <CardAction>
                  <CollectionAdminPanel
                    id={collection.id}
                    onCollectionUpdated={async () => {
                      // Re-fetch the latest collection data after edit
                      const res = await fetch(`/api/collections/${collection.id}`);
                      const updated = await res.json();
                      setCollection(updated);
                    }}
                  />
                </CardAction>
              )}
            </Card>
          </div>

          {/* Bids Table Section */}
          <Card className="mx-auto w-full max-w-4xl p-4 bg-zinc-900/80 shadow-lg border-0">
            <h2 className="font-semibold text-lg sm:text-xl">Bids for this Collection</h2>
            {collection ? (
              <>
                {Array.isArray(bids) && bids.length > 0 ? (
                  <BidsTable
                    collection={collection}
                    showPlaceBidButtonAtTop={
                      isLoggedIn && !isOwnerOfCollection && collection.status === 'open'
                    }
                  />
                ) : (
                  <div className="text-center text-muted-foreground mt-4">
                    <p className="text-zinc-500 text-sm sm:text-base">
                      No bids have been placed for this collection yet.
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center text-muted-foreground mt-4">
                <p className="text-zinc-500 text-sm sm:text-base">
                  Unable to load bids for this collection.
                </p>
              </div>
            )}
          </Card>
        </div>
      ) : (
        <Card className="flex min-h-[300px] flex-col items-center justify-center p-4 sm:p-8">
          <h1 className="mb-4 text-center font-bold text-2xl">Collection Not Found</h1>
          <p className="mb-4 text-center text-gray-600">
            {error ||
              'The collection you\u0026apos;re looking for doesn\u0026apos;t exist or may have been removed.'}
          </p>
          <GoBackButton size="sm" variant="link" />
        </Card>
      )}
    </PageWrapper>
  );
}
