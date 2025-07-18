import { Bitcoin } from 'lucide-react'

export default function LoadingIndicator() {
	return (
		<div className="flex min-h-screen items-center justify-center">
			<p className="text-gray-600">
				<Bitcoin className="animate-pulse" height={300} width={300} />
			</p>
		</div>
	)
}
