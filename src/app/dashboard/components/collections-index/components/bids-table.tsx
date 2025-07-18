'use client'

import type { ColumnDef } from '@tanstack/react-table'
import { formatDistanceToNow } from 'date-fns'
import { useAtomValue } from 'jotai'
import { useAtom } from 'jotai/react'
import {
	AlertCircle,
	Inbox,
	ArrowUpDown,
	User,
	Handshake,
	Ban,
	Hourglass,
	Delete,
	EllipsisVertical,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { ConfirmationDialog } from '@/components/confirmation-dialog'
import { DataTable } from '@/components/data-table'
import PlaceBidDialog from '@/components/place-bid-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
	userNamesAtom,
	bidsAtom,
	bidsLoadingAtom,
	bidsErrorAtom,
	userSessionAtom,
	userLoginStatusAtom,
} from '@/lib/atoms'
import { formatPrice, parseNumeric } from '@/lib/utils'
import type { Collection, Bid } from '@/types'

import { EditBidDialog } from '../../edit-bid-dialog.client'


interface BidsTableProps {
	collection: Collection
	showPlaceBidButtonAtTop?: boolean
}

export default function BidsTable({ collection, showPlaceBidButtonAtTop = false }: BidsTableProps) {
	const userNames = useAtomValue(userNamesAtom)
	const [bids, setBids] = useAtom(bidsAtom)
	const [bidsLoading, setBidsLoading] = useAtom(bidsLoadingAtom)
	const [bidsError, setBidsError] = useAtom(bidsErrorAtom)
	const isLoggedIn = useAtomValue(userLoginStatusAtom)
	const userSession = useAtomValue(userSessionAtom)
	const { user } = userSession
	const router = useRouter()
	const isOwner = isLoggedIn && user?.id === collection.ownerId

	// Check if the current user has already placed a bid on this collection
	const hasUserPlacedBid =
		isLoggedIn &&
		user &&
		Array.isArray(bids) &&
		bids.some((bid) => bid.userId === user.id && bid.collectionId === collection.id)

	// Only show place bid button if specifically requested AND user hasn't placed a bid yet
	const shouldShowPlaceBidAtTop = showPlaceBidButtonAtTop && !hasUserPlacedBid

	useEffect(() => {
		if (collection.id) {
			// Fetch bids for the collection
			const fetchBids = async () => {
				setBidsLoading(true)
				setBidsError(null)
				try {
					const response = await fetch(`/api/bids?collection_id=${collection.id}`)
					if (!response.ok) {
						throw new Error('Failed to fetch bids')
					}
					const data = await response.json()
					setBids(data)
				} catch (error) {
					console.error('Error fetching bids:', error)
					setBidsError('Failed to load bids. Please try again later.')
				} finally {
					setBidsLoading(false)
				}
			}
			fetchBids()
		}
	}, [collection.id, setBids, setBidsError, setBidsLoading])

	const columns: ColumnDef<Bid>[] = [
		{
			accessorKey: 'userId',
			header: ({ column }) => {
				return (
					<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						Bidder
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				)
			},
			cell: ({ row }) => {
				const userId = row.getValue('userId') as number
				const bidderName = userNames[userId] || `User ${userId}`
				return (
					<div className="flex items-center justify-center gap-2 md:justify-start">
						<User className="h-5 w-5 text-muted-foreground" />
						<div className="flex flex-col items-center md:flex-row md:items-start">
							<span className="mb-1 inline font-medium text-muted-foreground text-xs md:mr-1 md:mb-0 md:hidden">
								Bidder:
							</span>
							<span className="font-semibold">{bidderName}</span>
						</div>
					</div>
				)
			},
		},
		{
			accessorKey: 'price',
			header: ({ column }) => {
				return (
					<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						Amount
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				)
			},
			cell: ({ row }) => {
				const price = parseNumeric(row.getValue('price') as string)
				const status = row.getValue('status') as string

				return (
					<div className="flex flex-col text-center sm:block">
						<span className="mb-1 inline font-medium text-muted-foreground text-xs md:hidden">Amount:</span>
						<Badge
							variant={status === 'accepted' ? 'secondary' : status === 'rejected' ? 'struckthrough' : 'info'}
							className="inline-flex justify-center px-2 py-1 font-semibold text-base"
						>
							{formatPrice(price)}
						</Badge>
					</div>
				)
			},
		},
		{
			accessorKey: 'status',
			header: 'Status',
			cell: ({ row }) => {
				const status = row.getValue('status') as string

				if (status === 'accepted') {
					return (
						<Badge
							variant="secondary"
							className="inline-flex justify-center px-2 py-1 font-semibold text-base"
						>
							<Handshake className="mr-1 h-4 w-4" /> Accepted
						</Badge>
					)
				} else if (status === 'rejected') {
					return (
						<Badge
							variant="destructive"
							className="inline-flex justify-center px-2 py-1 font-semibold text-base"
						>
							<Ban className="mr-1 h-4 w-4" /> Rejected
						</Badge>
					)
				} else if (status === 'pending') {
					return (
						<Badge variant="outline" className="inline-flex justify-center px-2 py-1 font-semibold text-base">
							<Hourglass className="mr-1 h-4 w-4" /> Pending
						</Badge>
					)
				}

				return null
			},
		},
		{
			accessorKey: 'createdAt',
			header: ({ column }) => {
				return (
					<Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}>
						Date
						<ArrowUpDown className="ml-2 h-4 w-4" />
					</Button>
				)
			},
			cell: ({ row }) => {
				return (
					<div className="flex flex-col text-center sm:block">
						<span className="inline font-medium text-muted-foreground text-xs md:hidden">Posted:</span>
						<span className="ml-1">{formatDistanceToNow(row.getValue('createdAt'))}</span>
					</div>
				)
			},
		},
		{
			id: 'actions',
			header: 'Actions',
			size: 250, // Increase the column size for actions
			cell: ({ row }) => {
				const bid = row.original
				const status = row.getValue('status') as string
				const bidUserId = bid.userId
				const isUserBidder = isLoggedIn && user?.id === bidUserId
				const isPending = status === 'pending'

				return (
					<div className="flex min-w-[200px] justify-end gap-2">
						{/* Collection owner actions - Accept/Reject for pending bids */}
						{isOwner && collection.status === 'open' && isPending && (
							<>
								<Button
									variant="secondary"
									size="sm"
									className="w-full justify-center text-xs md:w-auto"
									onClick={() => {
										// Logic to accept bid
										console.log('Accept bid', bid.id)
									}}
								>
									<Handshake className="mr-1 h-4 w-4" />
									<span>Accept</span>
								</Button>
								<Button
									variant="destructive"
									size="sm"
									className="w-full justify-center text-xs md:w-auto"
									onClick={() => {
										// Logic to reject bid
										console.log('Reject bid', bid.id)
									}}
								>
									<Ban className="mr-1 h-4 w-4" />
									<span>Reject</span>
								</Button>
							</>
						)}

						{/* Bidder actions - Edit/Cancel their own pending bids */}
						{isUserBidder && collection.status === 'open' && isPending && (
							<>
								<EditBidDialog
									bid={bid}
									onBidUpdated={(): void => {
										router.push(`/bids/${bid.id}`)
									}}
								/>

								<ConfirmationDialog
									triggerText="Cancel"
									triggerIcon={Delete}
									onConfirm={() => {
										setBids((prev) => (Array.isArray(prev) ? prev.filter((b) => b.id !== bid.id) : []))
										router.push(`/collections/${collection.id}`)
									}}
								/>
							</>
						)}

						{/* View details is always available */}
						<Button variant="outline" size="sm" asChild className="ml-1 min-h-9 w-full md:w-auto">
							<Link
								href={`/bids/${bid.id}`}
								className="inline-flex items-center justify-center gap-1 whitespace-nowrap px-3 text-xs hover:underline"
								aria-label="View bid details"
							>
								<EllipsisVertical className="h-4 w-4" />
								<span className="inline">Details</span>
							</Link>
						</Button>
					</div>
				)
			},
		},
	]

	if (bidsLoading) {
		return (
			<Card className="w-full">
				<CardContent className="p-4">
					<CardTitle className="mb-4">Bids</CardTitle>
					<div className="space-y-2">
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
						<Skeleton className="h-8 w-full" />
					</div>
				</CardContent>
			</Card>
		)
	}

	if (bidsError) {
		return (
			<Card className="w-full">
				<CardContent className="p-4">
					<CardTitle className="mb-4">Bids</CardTitle>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertTitle>Error</AlertTitle>
						<AlertDescription>{bidsError}</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		)
	}

	if (!Array.isArray(bids) || bids.length === 0) {
		return (
			<Card className="w-full">
				<CardContent className="p-4">
					<CardTitle className="mb-4">Bids</CardTitle>
					<div className="flex h-auto min-h-[200px] flex-col items-center justify-center py-4 text-center text-muted-foreground">
						<div>
							<Inbox className="mx-auto h-12 w-12" />
							<span className="text-lg">No bids available.</span>
						</div>

						{/* Show Place Bid button for logged-in users who don't own the collection and haven't placed a bid yet */}
						{isLoggedIn && !isOwner && !hasUserPlacedBid && collection.status === 'open' && (
							<div className="mt-6">
								<PlaceBidDialog
									collectionId={collection.id}
									onSuccess={() => {
										// Refresh bids after a new bid is placed
										if (collection.id) {
											fetch(`/api/bids?collection_id=${collection.id}`)
												.then((response) => response.json())
												.then((data) => setBids(data))
												.catch((error) => console.error('Error fetching bids:', error))
										}
									}}
								/>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		)
	}

	// Sort bids in descending order by price (handle string/number)
	// Ensure bids is an array before sorting
	const bidsArray = Array.isArray(bids) ? bids : []
	const sortedBids =
		bidsArray.length > 0 ? [...bidsArray].sort((a, b) => parseNumeric(b.price) - parseNumeric(a.price)) : []

	return (
		<Card className="w-full">
			<CardContent className="overflow-visible p-2 sm:p-4">
				<CardTitle className="mb-4">Bids</CardTitle>

				{/* Show Place Bid button at the top if requested and user hasn't already placed a bid */}
				{shouldShowPlaceBidAtTop && (
					<div className="mb-4 w-full">
						<PlaceBidDialog
							collectionId={collection.id}
							onSuccess={() => {
								// Refresh bids after a new bid is placed
								if (collection.id) {
									fetch(`/api/bids?collection_id=${collection.id}`)
										.then((response) => response.json())
										.then((data) => setBids(data))
										.catch((error) => console.error('Error fetching bids:', error))
								}
							}}
						/>
					</div>
				)}

				<DataTable
					columns={columns}
					data={sortedBids}
					filterColumn="price"
					filterPlaceholder="Filter by price..."
					meta={{
						userNames,
						isOwner,
						collection,
					}}
				/>

				{/* Show Place Bid button for logged-in users who don't own the collection and haven't already placed a bid */}
				{isLoggedIn && !isOwner && !hasUserPlacedBid && collection.status === 'open' && (
					<div className="mt-4 flex justify-end">
						<PlaceBidDialog
							collectionId={collection.id}
							onSuccess={() => {
								// Refresh bids after a new bid is placed
								// This will be called when a bid is successfully placed
								if (collection.id) {
									fetch(`/api/bids?collection_id=${collection.id}`)
										.then((response) => response.json())
										.then((data) => setBids(data))
										.catch((error) => console.error('Error fetching bids:', error))
								}
							}}
						/>
					</div>
				)}
			</CardContent>
		</Card>
	)
}

BidsTable.displayName = 'BidsTable'
