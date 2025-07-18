import { ArrowLeft, CircleX } from 'lucide-react'
import router from 'next/router'
import { toast } from 'sonner'

import { ConfirmationDialog } from '@/components/confirmation-dialog'
import GoBackButton from '@/components/go-back-button.tsx'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { DELETE } from '@/lib/constants'
import type { Bid, Collection } from '@/types'

export default function BidDetailView({
	collection,
	bid,
	isBidder,
}: {
	collection: Collection | null
	bid: Bid
	isBidder: boolean | null
}) {
	return (
		<>
			<div className="mb-6 flex flex-col justify-between">
				<h1 className="font-bold text-2xl">Bid Details</h1>
				<GoBackButton icon={ArrowLeft} />
			</div>

			<Card className="mb-6 p-6">
				<div className="grid gap-4 md:grid-cols-2">
					<div>
						<h2 className="mb-4 font-semibold text-xl">Bid Information</h2>
						<div className="space-y-2">
							<p>
								<span className="font-semibold">ID:</span> {bid.id}
							</p>
							<p>
								<span className="font-semibold">Price:</span> ${bid.price.toLocaleString()}
							</p>
							<p>
								<span className="font-semibold">Status:</span>{' '}
								<span className="capitalize">{bid.status}</span>
							</p>
							<p>
								<span className="font-semibold">Created:</span> {new Date(bid.createdAt).toLocaleString()}
							</p>
							<p>
								<span className="font-semibold">Updated:</span> {new Date(bid.updatedAt).toLocaleString()}
							</p>
						</div>
					</div>

					<div>
						<h2 className="mb-4 font-semibold text-xl">Collection</h2>
						{collection ? (
							<div className="space-y-2">
								<p>
									<span className="font-semibold">Name:</span> {collection.name}
								</p>
								<p>
									<span className="font-semibold">Price:</span> ${collection.price?.toLocaleString()}
								</p>
								<p>
									<span className="font-semibold">Status:</span>{' '}
									<span className="capitalize">{collection.status}</span>
								</p>
								<Button
									variant="outline"
									className="mt-2"
									onClick={() => router.push(`/collections/${collection.id}`)}
								>
									View Collection
								</Button>
							</div>
						) : (
							<p className="text-gray-600">Collection details unavailable</p>
						)}
					</div>
				</div>
			</Card>

			{/* Show bidder actions if the current user is the bid owner */}
			{isBidder && bid.status === 'pending' && (
				<div className="mt-4 flex gap-3">
					<Button
						variant="outline"
						onClick={() => router.push(`/collections/${bid.collectionId}?edit=${bid.id}`)}
					>
						Edit Bid
					</Button>

					<ConfirmationDialog
						key={`cancel-bid-dialog-${bid.id}`}
						triggerText="Cancel Bid"
						triggerAriaLabel="open confirmation dialog to cancel bid"
						triggerIcon={CircleX}
						dialogTitle="Cancel Bid"
						dialogDescription="Are you sure you want to cancel this bid? This action cannot be undone."
						onConfirm={async () => {
							try {
								const response = await fetch(`/api/bids?bid_id=${bid.id}`, {
									method: DELETE,
									headers: {
										'Content-Type': 'application/json',
									},
								})

								if (!response.ok) {
									throw new Error('Failed to cancel bid')
								}

								toast.success('Bid cancelled successfully')
								router.push(`/collections/${bid.collectionId}`)
							} catch (error) {
								console.error('Error cancelling bid:', error)
								toast.error('Failed to cancel bid', {
									description: 'Please try again later',
								})
							}
						}}
					/>
				</div>
			)}
		</>
	)
}
