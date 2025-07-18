'use client';

import { ArrowLeft, CircleX, CheckCircle, Clock, XCircle, Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { ConfirmationDialog } from '@/components/confirmation-dialog';
import GoBackButton from '@/components/go-back-button.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DELETE } from '@/lib/constants';
import type { Bid, Collection } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { formatPrice, parseNumeric } from '@/lib/utils';

export default function BidDetailView({
  collection,
  bid,
  isBidder,
}: {
  collection: Collection | null;
  bid: Bid;
  isBidder: boolean | null;
}) {
  const router = useRouter();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        );
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'pending':
        return (
          <Badge variant="default" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-6 lg:py-8">
      <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row items-center justify-center lg:justify-between gap-4 lg:gap-0">
        <div>
          <h1 className="font-bold text-2xl sm:text-3xl lg:text-4xl text-white mb-1 sm:mb-2">
            Bid Details
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base lg:text-lg">ID #{bid.id}</p>
        </div>
        <GoBackButton icon={ArrowLeft} />
      </div>

      <Card className="mb-6 sm:mb-8 shadow-xl border-0 bg-zinc-900 text-white">
        <CardContent className="pt-0">
          <div className="grid gap-6 sm:gap-8 lg:gap-12 lg:grid-cols-2">
            <div>
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="p-1.5 sm:p-2 bg-blue-500/20 rounded-lg">
                  {getStatusIcon(bid.status)}
                </div>
                <h3 className="font-semibold text-lg sm:text-xl text-white">Bid Information</h3>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex justify-between items-center py-3 sm:py-4 border-b border-zinc-700">
                  <span className="text-zinc-400 text-sm sm:text-base font-medium">Price</span>
                  <span className="font-bold text-xl sm:text-2xl lg:text-3xl text-white">
                    {formatPrice(parseNumeric(bid.price))}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 sm:py-4 border-b border-zinc-700">
                  <span className="text-zinc-400 text-sm sm:text-base font-medium">Status</span>
                  <div className="text-right">{getStatusBadge(bid.status)}</div>
                </div>
                <div className="flex justify-between items-center py-3 sm:py-4 border-b border-zinc-700">
                  <span className="text-zinc-400 text-sm sm:text-base font-medium">Created</span>
                  <span className="text-white text-sm sm:text-base font-medium">
                    {formatDistanceToNow(bid.createdAt)} ago
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 sm:py-4">
                  <span className="text-zinc-400 text-sm sm:text-base font-medium">Updated</span>
                  <span className="text-white text-sm sm:text-base font-medium">
                    {formatDistanceToNow(bid.updatedAt)} ago
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 lg:mt-0">
              <div className="flex items-center gap-2 sm:gap-3 mb-6 sm:mb-8">
                <div className="p-1.5 sm:p-2 bg-emerald-500/20 rounded-lg">
                  <Archive
                    className="h-5 w-5 text-emerald-400"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </div>
                <h3 className="font-semibold text-lg sm:text-xl text-white">Collection</h3>
              </div>
              {collection ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex justify-between items-center py-3 sm:py-4 border-b border-zinc-700">
                    <span className="text-zinc-400 text-sm sm:text-base font-medium">Name</span>
                    <span className="text-white text-sm sm:text-base font-medium text-right max-w-[60%] break-words">
                      {collection.name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 sm:py-4 border-b border-zinc-700">
                    <span className="text-zinc-400 text-sm sm:text-base font-medium">Price</span>
                    <span className="text-white text-sm sm:text-base font-medium">
                      {formatPrice(parseNumeric(collection.price))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 sm:py-4 border-b border-zinc-700">
                    <span className="text-zinc-400 text-sm sm:text-base font-medium">Status</span>
                    <Badge
                      variant={collection.status === 'open' ? 'default' : 'secondary'}
                      className="capitalize"
                    >
                      {collection.status}
                    </Badge>
                  </div>
                  <Button
                    variant="outline"
                    className="mt-4 sm:mt-6 w-full h-10 sm:h-12 bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white font-medium text-sm sm:text-base"
                    onClick={() => router.push(`/collections/${collection.id}`)}
                  >
                    View Collection
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8 sm:py-12">
                  <p className="text-zinc-500 text-sm sm:text-base">
                    Collection details unavailable
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Show bidder actions if the current user is the bid owner */}
      {isBidder && bid.status === 'pending' && (
        <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4 sm:gap-6">
          <Button
            variant="outline"
            className="flex-1 h-12 sm:h-14 bg-zinc-800 border-zinc-600 text-zinc-300 hover:bg-zinc-700 hover:text-white hover:border-zinc-500 font-medium text-base sm:text-lg transition-all duration-200 active:scale-98 sm:active:scale-100"
            onClick={() => router.push(`/collections/${bid.collectionId}?edit=${bid.id}`)}
          >
            Edit Bid
          </Button>

          <ConfirmationDialog
            key={`cancel-bid-dialog-${bid.id}`}
            triggerText="Cancel Bid"
            triggerAriaLabel="open confirmation dialog to cancel bid"
            triggerIcon={CircleX}
            triggerVariant="destructive"
            dialogTitle="Cancel Bid"
            dialogDescription="Are you sure you want to cancel this bid? This action cannot be undone."
            onConfirm={async () => {
              try {
                const deleteUrl = `/api/bids/${bid.id}`;
                console.log('DELETE URL:', deleteUrl);

                const response = await fetch(deleteUrl, {
                  method: DELETE,
                  headers: {
                    'Content-Type': 'application/json',
                  },
                });

                console.log('Response status:', response.status);
                console.log('Response URL:', response.url);

                if (!response.ok) {
                  const errorData = await response.text();
                  console.log('Error response:', errorData);
                  throw new Error('Failed to cancel bid');
                }

                toast.success('Bid Cancelled Successfully!', {
                  description: 'Your bid has been removed from the collection',
                  icon: '✅',
                  duration: 4000,
                  className: 'bg-green-50 border-green-200 text-green-900',
                });
                router.push(`/collections/${bid.collectionId}`);
              } catch (error) {
                console.error('Error cancelling bid:', error);
                toast.error('Failed to Cancel Bid', {
                  description: 'Please try again later or contact support',
                  icon: '❌',
                  duration: 5000,
                  className: 'bg-red-50 border-red-200 text-red-900',
                });
              }
            }}
          />
        </div>
      )}
    </div>
  );
}
