import { ArrowLeft } from 'lucide-react'

import GoBackButton from '@/components/go-back-button.tsx'

export default function BidNotFound() {
	return (
		<div className="flex min-h-[300px] flex-col items-center justify-center">
			<h1 className="mb-4 font-bold text-2xl">Bid Not Found</h1>
			<p className="mb-4 text-gray-600">
				The bid you&apos;re looking for doesn&apos;t exist or may have been removed.
			</p>
			<GoBackButton icon={ArrowLeft} />
		</div>
	)
}
