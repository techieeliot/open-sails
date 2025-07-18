'use client'

import { useAtomValue } from 'jotai'
import { ArrowLeft, Bitcoin } from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import BidsTable from '@/app/dashboard/components/collections-index/components/bids-table'
import { ConfirmationDialog } from '@/components/confirmation-dialog'
import PageWrapper from '@/components/page-wrapper'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { userSessionAtom } from '@/lib/atoms'
import { API_ENDPOINTS, CONTENT_TYPE_JSON, DELETE } from '@/lib/constants'
import type { Collection, User } from '@/types'

import EditCollectionDialog from '../edit-collection-dialog'
import PlaceBidDialog from '../place-bid-dialog'

export function CollectionDetailsClient() {
	const params = useParams()
	const router = useRouter()
	const userSession = useAtomValue(userSessionAtom)
	const isLoggedIn = userSession.user
	const [collection, setCollection] = useState<Collection | null>(null)
	const [owner, setOwner] = useState<User | null>(null)
	const [isLoading, setIsLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const collectionId = Number(params.id)

	useEffect(() => {
		const fetchCollectionDetails = async () => {
			try {
				setIsLoading(true)
				setError(null)

				// Fetch the collection details
				const response = await fetch(`${API_ENDPOINTS.collections}/${collectionId}`)
				if (!response.ok) {
					throw new Error('Failed to fetch collection details')
				}

				const collectionData = await response.json()
				setCollection(collectionData)

				// Fetch owner details
				if (collectionData.ownerId) {
					const userResponse = await fetch(`/api/users?id=${collectionData.ownerId}`)
					if (userResponse.ok) {
						const userData = await userResponse.json()
						setOwner(userData)
					}
				}
			} catch (error) {
				console.error('Error fetching collection details:', error)
				setError('Failed to fetch collection details. Please try again later.')
				toast.error('Failed to load collection details', {
					description: 'Please try again later',
				})
			} finally {
				setIsLoading(false)
			}
		}

		if (collectionId) {
			fetchCollectionDetails()
		}
	}, [collectionId])

	const handleBack = () => {
		router.back()
	}

	const handleDeleteCollection = async () => {
		try {
			const response = await fetch(`/api/collections/${collectionId}`, {
				method: DELETE,
				headers: {
					'Content-Type': CONTENT_TYPE_JSON,
				},
			})

			if (!response.ok) {
				const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
				throw new Error(errorData.error || 'Failed to delete collection')
			}

			toast.success('Collection deleted successfully')
			router.push('/dashboard')
		} catch (error) {
			console.error('Error deleting collection:', error)
			toast.error('Failed to delete collection', {
				description: error instanceof Error ? error.message : 'Please try again later',
			})
		}
	}

	const isOwnerOfCollection = !!(isLoggedIn && collection && isLoggedIn.id === collection.ownerId)

	if (isLoading) {
		return (
			<PageWrapper>
				<div className="flex min-h-[300px] items-center justify-center">
					<p className="text-gray-600">
						<Bitcoin className="animate-pulse" height={300} width={300} />
					</p>
				</div>
			</PageWrapper>
		)
	}

	if (error || !collection) {
		return (
			<PageWrapper>
				<div className="flex min-h-[300px] flex-col items-center justify-center">
					<h1 className="mb-4 font-bold text-2xl">Collection Not Found</h1>
					<p className="mb-4 text-gray-600">
						{error || "The collection you're looking for doesn't exist or may have been removed."}
					</p>
					<Button onClick={handleBack} className="inline-flex items-center gap-2">
						<ArrowLeft />
						Go Back
					</Button>
				</div>
			</PageWrapper>
		)
	}

	return (
		<PageWrapper>
			{/* create a wrapper so the page is a minimum of  */}

			<div className="mb-6 flex flex-col justify-between gap-2">
				<Link href="/dashboard">
					<Button variant="outline" size="sm">
						Back to Dashboard
					</Button>
				</Link>
			</div>

			<Card className="mb-6 p-6">
				<h1 className="mb-4 font-bold text-2xl">{collection.name}</h1>
				<div className="grid gap-8 md:grid-cols-2">
					<div>
						<h2 className="mb-4 font-semibold text-xl">Collection Information</h2>
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
								<h3 className="mb-2 font-semibold text-lg">Description</h3>
								<p className="whitespace-pre-wrap text-gray-700">{collection.descriptions}</p>
							</div>
						)}
					</div>
					<div>
						<h2 className="mb-4 font-semibold text-xl">Owner Information</h2>
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
					{collection.status === 'open' && (
						<div className="flex items-center justify-end gap-4">
							{isOwnerOfCollection && (
								<div className="flex gap-2">
									<EditCollectionDialog
										collectionId={collection.id}
										onSuccess={(): void => {
											router.refresh()
										}}
									/>
									<ConfirmationDialog
										key={`delete-dialog-${collection.id}`}
										triggerText="Delete"
										dialogTitle="Delete Collection"
										dialogDescription="Are you sure you want to delete this collection? This action cannot be undone."
										onConfirm={handleDeleteCollection}
									/>
								</div>
							)}
							{isLoggedIn && !isOwnerOfCollection && (
								<div className="flex">
									<PlaceBidDialog collectionId={collection.id} />
								</div>
							)}
						</div>
					)}
				</div>
			</Card>

			<h2 className="mb-4 font-semibold text-xl">Bids for this Collection</h2>
			<BidsTable collection={collection} />
		</PageWrapper>
	)
}
