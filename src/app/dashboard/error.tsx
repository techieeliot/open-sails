'use client'

import PageWrapper from '@/components/page-wrapper'

export default function ErrorPage({ error }: { error: Error | null }) {
	return (
		<PageWrapper>
			<h1 className="font-bold text-4xl">Something went wrong</h1>
			<p className="mt-4 text-lg">Please try again later.</p>
			{error && (
				<div className="mt-4 text-red-500">
					<p>Error details:</p>
					<pre>{JSON.stringify(error?.toString())}</pre>
				</div>
			)}
		</PageWrapper>
	)
}
