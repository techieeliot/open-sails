'use client';

import { Button } from '@/components/ui/button';
import { Collection, Bid } from '@/types';
import { Fragment, Suspense, useCallback, useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { collectionsAtom, userSessionAtom } from '@/lib/atoms';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ArrowDownFromLine,
  ArrowUpToLine,
  Bitcoin,
  CircleCheckBig,
  CircleChevronRight,
  CircleX,
  HardDriveDownload,
  Square,
  SquareCheckBig,
} from 'lucide-react';
import { API_ENDPOINTS } from '@/lib/constants';
import { Badge, BadgeProps } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { EditBidDialog } from '@/app/dashboard/components/bids-list/components/edit-bid-dialog.client';
import { toast } from 'sonner';
import Link from 'next/link';
import CreateCollectionDialog from '@/components/create-collection-dialog';
import EditCollectionDialog from '@/components/edic-collection-dialog';
import DeleteCollectionDialog from '../delete-collection-dialog';
import PlaceBidDialog from '@/components/place-bid-dialog';
import { safeStringify, toStartCase } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import TriggerIconButton from '@/components/trigger-icon-button';

export default function CollectionsIndex() {
  const { user } = useAtomValue(userSessionAtom);
  const router = useRouter();
  const [collections, setCollections] = useAtom(collectionsAtom);
  const [expandedCollection, setExpandedCollection] = useState<number | null>(null);
  const [visibleCount, setVisibleCount] = useState(25);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Bids state for expanded collection
  const [bids, setBids] = useState<Bid[]>([]);
  const [bidsLoading, setBidsLoading] = useState(false);
  const [bidsError, setBidsError] = useState<string | null>(null);
  const [userNames, setUserNames] = useState<Record<string, string>>({});

  const fetchCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('Fetching collections from API...');
      const response = await fetch(API_ENDPOINTS.collections);

      console.log('Collections response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Collections API error response:', errorText);
        throw new Error(`Failed to fetch collections: ${response.status} - ${errorText}`);
      }

      const collectionData: Collection[] = await response.json();
      console.log('Received collection data:', collectionData.length, 'collections');

      if (Array.isArray(collectionData)) {
        // Sort collections by createdAt date (newest first)
        const sortedCollections = [...collectionData].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
        setCollections(sortedCollections);
      } else {
        throw new Error('Received invalid data format for collections');
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load collections';
      setError(errorMessage);
      setCollections([]);
    } finally {
      setLoading(false);
    }
  }, [setCollections]);

  useEffect(() => {
    fetchCollections();
  }, [fetchCollections]);

  // Fetch bids when a collection is expanded
  useEffect(() => {
    if (expandedCollection) {
      setBidsLoading(true);
      setBidsError(null);
      fetch(`/api/bids?collection_id=${expandedCollection}`)
        .then(async (res) => {
          if (!res.ok) throw new Error('Failed to fetch bids');
          const data = await res.json();
          setBids(Array.isArray(data) ? data : []);

          // Fetch user names for bids
          const uniqueUserIds = Array.from(
            new Set((Array.isArray(data) ? data : []).map((bid: Bid) => String(bid.userId))),
          );
          if (uniqueUserIds.length > 0) {
            try {
              const usersResponse = await fetch('/api/users');
              if (usersResponse.ok) {
                const usersData = await usersResponse.json();
                const userMap: Record<string, string> = {};
                usersData.forEach((u: { id: string | number; name?: string }) => {
                  if (u.id) {
                    userMap[String(u.id)] = u.name || 'Anonymous User';
                  }
                });
                setUserNames(userMap);
              }
            } catch (error) {
              console.error('Error fetching user names:', safeStringify(error));
            }
          }
        })
        .catch((err) => {
          setBidsError(err.message || 'Failed to load bids');
          setBids([]);
        })
        .finally(() => setBidsLoading(false));
    } else {
      setBids([]);
      setBidsError(null);
    }
  }, [expandedCollection]);

  return (
    <div className="flex flex-col gap-6 w-full h-full max-w-8xl mx-auto p-4">
      <Suspense
        fallback={
          <div className="text-center text-muted-foreground">
            <Bitcoin className="animate-pulse" height={300} width={300} />
          </div>
        }
      >
        <div className="flex w-full items-end justify-end max-w-8xl h-32">
          {!loading && user && <CreateCollectionDialog onSuccess={fetchCollections} />}
        </div>

        {error && (
          <div className="p-4 border border-red-300 rounded-lg bg-red-50 text-red-700 max-w-md mx-auto">
            <div className="font-medium mb-2">Error loading collections</div>
            <div className="text-sm mb-3">{error}</div>
            <Button size="sm" variant="outline" onClick={fetchCollections} disabled={loading}>
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="text-center text-muted-foreground min-w-md">
            <Bitcoin className="animate-pulse" height={500} width={500} />
          </div>
        ) : collections.length === 0 && !error ? (
          <div className="text-center text-muted-foreground h-screen">
            No collections found yet...
          </div>
        ) : (
          !error && (
            <Table className="w-full border-separate border-spacing-y-6">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3 text-lg font-bold">All Collections</TableHead>
                  <TableHead className="w-1/3 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {collections.slice(0, visibleCount).map((collection) => {
                  const isOwner = user !== null && user?.id === collection.ownerId;
                  const isExpanded = expandedCollection === collection.id;
                  const badgeVariant = collection.status === 'open' ? 'info' : 'outline';
                  return (
                    <Fragment key={collection.id}>
                      <TableRow
                        key={collection.id}
                        className="bg-card rounded-2xl shadow-md border border-border align-top"
                        onClick={() => setExpandedCollection(isExpanded ? null : collection.id)}
                      >
                        <TableCell className="flex gap-8 align-top rounded-l-2xl font-semibold text-base py-6">
                          {isExpanded ? (
                            <ArrowUpToLine className="h-4 w-4" />
                          ) : (
                            <ArrowDownFromLine className="h-4 w-4" />
                          )}
                          {collection.status === 'open' ? (
                            <Square className="h-4 w-4" />
                          ) : (
                            <SquareCheckBig className="h-4 w-4" />
                          )}
                          <Badge variant={badgeVariant as BadgeProps['variant']} size="lg">
                            {collection.price}
                          </Badge>
                          {collection.name}
                        </TableCell>
                        <TableCell className="align-top text-right rounded-r-2xl py-6">
                          <div className="flex gap-2 justify-end">
                            {/* Show edit and delete dialog only if owner */}
                            {collection.status === 'open' &&
                              (isOwner ? (
                                <>
                                  <EditCollectionDialog
                                    collectionId={collection.id}
                                    onSuccess={fetchCollections}
                                  />
                                  <DeleteCollectionDialog
                                    collectionId={collection.id}
                                    onSuccess={fetchCollections}
                                  />
                                </>
                              ) : (
                                // Show bid dialog only if not owner and collection is open
                                <PlaceBidDialog
                                  collectionId={collection.id}
                                  onSuccess={fetchCollections}
                                />
                              ))}

                            {/* Show Collection Details */}
                            <Button size="sm" variant="link" asChild>
                              <Link
                                href={`/collections/${collection.id}`}
                                title="View Collection Details"
                              >
                                <CircleChevronRight className="h-5 w-5" />
                                <span className="hidden md:inline">Show more</span>
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                      {isExpanded && (
                        <TableRow className="bg-transparent">
                          <TableCell colSpan={3} className="p-0">
                            <div className="w-full px-8 pb-8">
                              <div className="rounded-2xl border border-border bg-card/80 p-4 mt-2">
                                <div className="font-semibold mb-2 text-accent">Bids</div>
                                {bidsLoading ? (
                                  <div className="text-muted-foreground italic">
                                    Loading bids...
                                  </div>
                                ) : bidsError ? (
                                  <div className="text-red-500 italic">{bidsError}</div>
                                ) : bids.length === 0 ? (
                                  <div className="text-muted-foreground italic">No bids yet...</div>
                                ) : (
                                  <Table className="w-full border-spacing-y-2">
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="w-1/4">Bidder</TableHead>
                                        <TableHead className="w-1/4">Amount</TableHead>
                                        <TableHead className="w-1/4">Status</TableHead>
                                        <TableHead className="w-1/4">Placed</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {bids.map((bid) => {
                                        const isBidder = user && bid.userId === user.id;
                                        return (
                                          <TableRow key={bid.id} className="bg-transparent">
                                            <TableCell>
                                              {userNames[String(bid.userId)]
                                                ? userNames[String(bid.userId)]
                                                : `User ${bid.userId}`}
                                            </TableCell>
                                            <TableCell>
                                              $
                                              {bid.price?.toLocaleString(undefined, {
                                                minimumFractionDigits: 2,
                                                maximumFractionDigits: 2,
                                              })}
                                            </TableCell>
                                            <TableCell>
                                              <Badge
                                                variant={
                                                  bid.status === 'rejected'
                                                    ? 'destructive'
                                                    : bid.status === 'accepted'
                                                      ? 'success'
                                                      : 'outline'
                                                }
                                                className="px-2 py-1 text-xs font-semibold"
                                              >
                                                {toStartCase(bid.status)}
                                              </Badge>
                                            </TableCell>
                                            <TableCell>
                                              {bid.createdAt
                                                ? new Date(bid.createdAt).toLocaleString()
                                                : ''}
                                            </TableCell>
                                            <TableCell className="text-right">
                                              <div className="flex gap-2 justify-end">
                                                {/* Owner actions: Accept/Reject pending bids */}
                                                {isOwner && bid.status === 'pending' && (
                                                  <>
                                                    <ConfirmationDialog
                                                      key={`accept-dialog-${bid.id}`}
                                                      triggerText="Accept"
                                                      triggerIcon={CircleCheckBig}
                                                      triggerAriaLabel="open confirmation dialog to accept bid"
                                                      dialogTitle="Accept Bid"
                                                      dialogDescription="Are you sure you want to accept this bid?"
                                                      onConfirm={async () => {
                                                        try {
                                                          await fetch(
                                                            `/api/bids?collection_id=${bid.collectionId}&bid_id=${bid.id}`,
                                                            {
                                                              method: 'PUT',
                                                              headers: {
                                                                'Content-Type': 'application/json',
                                                              },
                                                              body: JSON.stringify({
                                                                status: 'accepted',
                                                              }),
                                                            },
                                                          );
                                                          toast.success(
                                                            'Bid accepted successfully',
                                                            {
                                                              description:
                                                                'The collection is now closed and other bids have been rejected',
                                                              duration: 5000,
                                                            },
                                                          );
                                                          // Refetch collections and bids to ensure UI is always up-to-date
                                                          setBidsLoading(true);
                                                          setLoading(true);
                                                          // Refetch collections with cache-busting
                                                          await fetchCollections();
                                                          setExpandedCollection(null);
                                                          setBids([]);
                                                          setBidsLoading(false);
                                                          setLoading(false);
                                                          // Redirect to the collection details page
                                                          router.push(
                                                            `/collections/${bid.collectionId}`,
                                                          );
                                                        } catch {
                                                          toast.error('Failed to accept bid', {
                                                            description: 'Please try again later',
                                                          });
                                                          setBidsLoading(false);
                                                          setLoading(false);
                                                        }
                                                      }}
                                                    />
                                                    <ConfirmationDialog
                                                      key={`reject-dialog-${bid.id}`}
                                                      triggerText="Reject"
                                                      triggerIcon={CircleX}
                                                      triggerAriaLabel="open confirmation dialog to reject bid"
                                                      dialogTitle="Reject Bid"
                                                      dialogDescription="Are you sure you want to reject this bid?"
                                                      onConfirm={async () => {
                                                        try {
                                                          await fetch(
                                                            `/api/bids?collection_id=${bid.collectionId}&bid_id=${bid.id}`,
                                                            {
                                                              method: 'PUT',
                                                              headers: {
                                                                'Content-Type': 'application/json',
                                                              },
                                                              body: JSON.stringify({
                                                                status: 'rejected',
                                                              }),
                                                            },
                                                          );
                                                          toast.success(
                                                            'Bid rejected successfully',
                                                          );
                                                          setBidsLoading(true);
                                                          const res = await fetch(
                                                            `/api/bids?collection_id=${expandedCollection}`,
                                                          );
                                                          const data = await res.json();
                                                          setBids(Array.isArray(data) ? data : []);
                                                          setBidsLoading(false);
                                                        } catch {
                                                          toast.error('Failed to reject bid', {
                                                            description: 'Please try again later',
                                                          });
                                                        }
                                                      }}
                                                    />
                                                  </>
                                                )}

                                                {/* Bidder actions: Edit/Cancel pending bids */}
                                                {!isOwner &&
                                                  isBidder &&
                                                  bid.status === 'pending' && (
                                                    <>
                                                      <EditBidDialog
                                                        bid={bid}
                                                        onBidUpdated={async () => {
                                                          setBidsLoading(true);
                                                          const res = await fetch(
                                                            `/api/bids?collection_id=${expandedCollection}`,
                                                          );
                                                          const data = await res.json();
                                                          setBids(Array.isArray(data) ? data : []);
                                                          setBidsLoading(false);
                                                        }}
                                                      />
                                                      <ConfirmationDialog
                                                        key={`cancel-dialog-${bid.id}`}
                                                        triggerText="Cancel Bid"
                                                        dialogTitle="Cancel Bid"
                                                        dialogDescription="Are you sure you want to cancel your bid?"
                                                        onConfirm={async () => {
                                                          try {
                                                            await fetch(
                                                              `/api/bids?bid_id=${bid.id}`,
                                                              {
                                                                method: 'DELETE',
                                                                headers: {
                                                                  'Content-Type':
                                                                    'application/json',
                                                                },
                                                              },
                                                            );
                                                            toast.success(
                                                              'Bid cancelled successfully',
                                                            );
                                                            setBidsLoading(true);
                                                            const res = await fetch(
                                                              `/api/bids?collection_id=${expandedCollection}`,
                                                            );
                                                            const data = await res.json();
                                                            setBids(
                                                              Array.isArray(data) ? data : [],
                                                            );
                                                            setBidsLoading(false);
                                                          } catch {
                                                            toast.error('Failed to cancel bid', {
                                                              description: 'Please try again later',
                                                            });
                                                          }
                                                        }}
                                                      />
                                                    </>
                                                  )}
                                              </div>
                                            </TableCell>
                                          </TableRow>
                                        );
                                      })}
                                    </TableBody>
                                  </Table>
                                )}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          )
        )}
      </Suspense>
      {!loading && !error && visibleCount < collections.length && (
        <div className="flex w-full justify-center">
          <TriggerIconButton
            onClick={() => setVisibleCount((prev) => prev + 10)}
            variant="outline"
            icon={HardDriveDownload}
          >
            Load More Collections
          </TriggerIconButton>
        </div>
      )}
    </div>
  );
}
