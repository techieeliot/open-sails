import { formatDistanceToNow } from 'date-fns'
import { useAtomValue } from 'jotai'
import { CheckCircle, CircleX, HardDriveDownload, Inbox } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'

import LoadingIndicator from '@/components/bid-details/components/loading'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import TriggerIconButton from '@/components/trigger-icon-button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { userSessionAtom } from '@/lib/atoms'
import { DELETE, PUT } from '@/lib/constants'
import { parseNumeric , cn, formatPrice, formatUserId } from '@/lib/utils'
import type { Bid } from '@/types'

import { EditBidDialog } from './components/edit-bid-dialog.client'

export interface BidIndexProps {
	isOwner: boolean
	collectionId: number
}

export const BidList = ({ isOwner, collectionId }: BidIndexProps) => {
	const [bids, setBids] = useState<Bid[]>([])
	const INITIAL_VISIBLE_BIDS_COUNT = 10
	const [visibleBidsCount, setVisibleBidsCount] = useState(INITIAL_VISIBLE_BIDS_COUNT)
	const userSession = useAtomValue(userSessionAtom)
	const isLoggedIn = userSession.user
	const [userNames, setUserNames] = useState<Record<string, string>>({})
	const userCache = useState<Record<string, string>>({})[0]
	const router = useRouter()

	const fetchUserNames = useCallback(
		async (userIds: string[]) => {
			// Only fetch users not already in cache
			const missingUserIds = userIds.filter((id) => !(id in userCache))
			if (missingUserIds.length === 0) return

			try {
				const usersResponse = await fetch('/api/users')
				if (usersResponse.ok) {
					const usersData = await usersResponse.json()
					const userMap: Record<string, string> = { ...userCache }

					usersData.forEach((u: { id: string | number; name?: string }) => {
						if (u.id && missingUserIds.includes(String(u.id))) {
							userMap[String(u.id)] = u.name || 'Anonymous User'
						}
					})

					setUserNames(userMap)
				}
			} catch (error) {
				console.error('Failed to fetch user details:', error)
			}
		},
		[userCache],
	)

	const fetchBids = useCallback(async () => {
		if (collectionId) {
			const response = await fetch(`/api/bids?collection_id=${collectionId}`)
			let data: unknown = await response.json()
			// Defensive: ensure data is an array
			if (!Array.isArray(data)) {
				data = []
			}
			setBids(data as Bid[])

			// Extract unique user IDs from bids
			const uniqueUserIds = Array.from(new Set((data as Bid[]).map((bid) => String(bid.userId))))

			// Fetch user details for these IDs if we have any
			if (uniqueUserIds.length > 0) {
				fetchUserNames(uniqueUserIds)
			}
		}
	}, [collectionId, fetchUserNames])

	const resolveBid = async (
		bidId: number,
		collectionId: number,
		status: 'accepted' | 'rejected' | 'cancelled',
	) => {
		await fetch(`/api/bids?collection_id=${collectionId}&bid_id=${bidId}`, {
			method: PUT,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				status,
			}),
		})
	}

	const cancelBid = async (bidId: number) => {
		await fetch(`/api/bids?bid_id=${bidId}`, {
			method: DELETE,
			headers: {
				'Content-Type': 'application/json',
			},
		})
	}

	useEffect(() => {
		fetchBids()
	}, [fetchBids])

	if (!collectionId) {
		return <div className="text-center text-muted-foreground">No collection selected.</div>
	}

	return (
		<div className="grid w-full place-items-center gap-4 md:min-w-96">
			<Suspense fallback={<LoadingIndicator />}>
				{bids.length === 0 ? (
					<div className="col-span-12 text-center text-muted-foreground">
						<Inbox className="mx-auto mb-2 h-6 w-6" />
						<span className="inline">No bids found for this collection yet...</span>
					</div>
				) : (
					<>
						<Table className="w-full divide-y divide-gray-200 rounded-lg bg-white shadow dark:divide-gray-700 dark:bg-gray-900">
							<TableHeader>
								<TableRow
									className={cn(
										'th]:text-gray-700 th]:text-gray-200 bg-gray-50 [&> dark:bg-gray-800 dark:[&>',
										'th]:px-4 th]:py-3 th]:text-left [&> [&> [&>',
									)}
								>
									<TableHead className="w-1/6">Bid ID</TableHead>
									<TableHead className="w-1/6">User</TableHead>
									<TableHead className="w-1/6">Price</TableHead>
									<TableHead className="w-1/6">Status</TableHead>
									<TableHead className="w-1/6">Time Placed</TableHead>
									<TableHead className="w-1/6">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
								{bids.slice(0, visibleBidsCount).map((bid, index) => {
									const isBidder = isLoggedIn && bid.userId === isLoggedIn.id
									return (
										<TableRow key={bid.id} className="transition hover:bg-gray-50 dark:hover:bg-gray-800">
											<TableCell className="whitespace-nowrap px-4 py-3">
												<Link
													href={`/bids/${bid.id}`}
													className="text-blue-500 hover:underline"
													aria-label={`View details for bid ${bid.id}`}
												>
													Bid #{bid.id}
												</Link>
											</TableCell>
											<TableCell className="whitespace-nowrap px-4 py-3">
												<span className="block md:hidden">User: </span>
												<span
													className={cn(
														'rounded-md px-2 py-1 text-sm',
														isBidder
															? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
															: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
													)}
												>
													{bid.userId && userNames[String(bid.userId)]
														? `${userNames[String(bid.userId)]}`
														: `User ${formatUserId(bid.userId)}`}
													{isBidder && ' (You)'}
												</span>
											</TableCell>
											<TableCell className="whitespace-nowrap px-4 py-3">
												<span className="block md:hidden">Price: </span>
												<span>{formatPrice(parseNumeric(bid.price))}</span>
											</TableCell>
											<TableCell className="whitespace-nowrap px-4 py-3 capitalize">
												<span className="block md:hidden">Status: </span>
												<span
													className={cn(
														'rounded px-2 py-1 font-semibold text-xs',
														bid.status === 'accepted'
															? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
															: bid.status === 'rejected'
																? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
																: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
													)}
												>
													{bid.status}
												</span>
											</TableCell>
											<TableCell className="whitespace-nowrap px-4 py-3">
												<span className="block md:hidden">Time Placed: </span>
												{formatDistanceToNow(bid.createdAt, { addSuffix: true })}
											</TableCell>
											<TableCell className="whitespace-nowrap px-4 py-3">
												<div className="flex w-full flex-col items-stretch gap-6 sm:w-auto sm:flex-row">
													{isOwner && bid.status === 'pending' ? (
														<>
															<ConfirmationDialog
																key={`accept-dialog-${bid.id}`}
																triggerText="Accept"
																triggerIcon={CheckCircle}
																triggerAriaLabel="open confirmation dialog to accept bid"
																dialogTitle="Accept Bid"
																dialogDescription="Are you sure you want to accept this bid?"
																onConfirm={async () => {
																	try {
																		await resolveBid(bid.id, bid.collectionId, 'accepted')
																		toast.success('Bid accepted successfully', {
																			description:
																				'The collection is now closed and other bids have been rejected',
																			duration: 5000,
																		})
																		fetchBids()
																	} catch (error) {
																		console.error('Failed to accept bid:', error)
																		toast.error('Failed to accept bid', {
																			description: 'Please try again later',
																		})
																	}
																}}
															/>
															<ConfirmationDialog
																key={`reject-dialog-${bid.id}`}
																triggerText="Reject"
																triggerAriaLabel="open confirmation dialog to reject bid"
																triggerIcon={CircleX}
																triggerVariant="destructive"
																dialogTitle="Reject Bid"
																dialogDescription="Are you sure you want to reject this bid?"
																onConfirm={async () => {
																	try {
																		await resolveBid(bid.id, bid.collectionId, 'rejected')
																		toast.success('Bid rejected successfully')
																		fetchBids()
																	} catch (error) {
																		console.error('Failed to reject bid:', error)
																		toast.error('Failed to reject bid', {
																			description: 'Please try again later',
																		})
																	}
																}}
															/>
														</>
													) : !isOwner && bid.status === 'pending' && isBidder ? (
														<>
															<EditBidDialog bid={bid} onBidUpdated={fetchBids} />
															<ConfirmationDialog
																key={`cancel-dialog-${bid.id}`}
																triggerText="Cancel"
																triggerAriaLabel="open confirmation dialog to cancel bid"
																triggerIcon={CircleX}
																triggerVariant="destructive"
																dialogTitle="Cancel Bid"
																onConfirm={async () => {
																	try {
																		await cancelBid(bid.id)
																		toast.success('Bid cancelled successfully')
																		fetchBids()
																	} catch (error) {
																		console.error('Failed to cancel bid:', error)
																		toast.error('Failed to cancel bid', {
																			description: 'Please try again later',
																		})
																	}
																}}
															/>
														</>
													) : null}
												</div>
											</TableCell>
										</TableRow>
									)
								})}
							</TableBody>
						</Table>
						{visibleBidsCount < bids.length && (
							<div className="mt-4 flex w-full justify-center [&>button]:w-full md:[&>button]:w-auto">
								<TriggerIconButton
									onClick={() => setVisibleBidsCount((prev) => prev + 10)}
									variant="outline"
									icon={HardDriveDownload}
								>
									Load More Bids
								</TriggerIconButton>
							</div>
						)}
					</>
				)}
			</Suspense>
		</div>
	)
}
BidList.displayName = 'BidList'
