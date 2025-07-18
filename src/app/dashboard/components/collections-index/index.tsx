'use client'

import { useAtomValue } from 'jotai/react'
import { BadgeAlert, Inbox } from 'lucide-react'
import { useEffect } from 'react'

import LoadingIndicator from '@/components/bid-details/components/loading'
import CreateCollectionDialog from '@/components/create-collection-dialog'
import { Button } from '@/components/ui/button'
import { useFetchCollections } from '@/hooks/useFetchCollections'
import {
	collectionsErrorAtom,
	collectionsLoadingAtom,
	sortedCollectionsAtom,
	userLoginStatusAtom,
} from '@/lib/atoms'

import CollectionsTable from './components/collections-table'

export default function CollectionsIndex() {
	const sortedCollections = useAtomValue(sortedCollectionsAtom)
	const loading = useAtomValue(collectionsLoadingAtom)
	const error = useAtomValue(collectionsErrorAtom)
	const isLoggedIn = useAtomValue(userLoginStatusAtom)

	const fetchCollections = useFetchCollections()

	// Fetch collections on mount
	useEffect(() => {
		fetchCollections()
	}, [fetchCollections])

	return (
		<div className="mx-auto flex w-full flex-col gap-6 overflow-hidden pt-6">
			<div className="mb-2 flex w-full flex-col items-center justify-between gap-4 md:flex-row md:gap-0">
				{!loading && isLoggedIn && (
					<>
						<h2 className="font-bold text-2xl text-foreground">All Collections</h2>
						<CreateCollectionDialog onSuccess={fetchCollections} />
					</>
				)}
			</div>

			{error && (
				<div className="mx-auto flex max-w-md flex-col items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-destructive shadow-md">
					<BadgeAlert className="mb-2 h-8 w-8" />
					<span className="font-semibold text-lg">Error loading collections</span>
					<div className="mb-2 text-sm">{error}</div>
					<Button
						size="sm"
						variant="destructive"
						onClick={fetchCollections}
						disabled={loading}
						className="w-full"
					>
						Retry
					</Button>
				</div>
			)}

			{loading ? (
				<LoadingIndicator />
			) : !error && sortedCollections.length === 0 ? (
				<div className="flex flex-col items-center justify-center gap-4 py-16">
					<Inbox className="h-20 w-20 text-muted-foreground" />
					<span className="font-medium text-lg text-muted-foreground">No collections found yet...</span>
					{!loading && isLoggedIn && <CreateCollectionDialog onSuccess={fetchCollections} />}
				</div>
			) : (
				!error && <CollectionsTable />
			)}
		</div>
	)
}
