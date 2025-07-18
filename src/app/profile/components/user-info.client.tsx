'use client'

import { useAtomValue } from 'jotai'
import { ArrowLeft, Car } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardTitle } from '@/components/ui/card'
import { userSessionAtom } from '@/lib/atoms'

export default function UserInfo() {
	const userSession = useAtomValue(userSessionAtom)
	const isLoggedIn = userSession.user
	const router = useRouter()

	if (!isLoggedIn) {
		return (
			<Card className="mx-auto mt-4 rounded border p-4">
				<CardTitle className="text-center">
					<h2 className="font-semibold text-lg">Please log in</h2>
				</CardTitle>
				<CardContent>
					<CardDescription className="text-gray-600 text-sm">
						<p className="text-gray-300 text-sm">You need to be logged in to view your user information.</p>
					</CardDescription>
				</CardContent>
				<CardAction className="flex w-full justify-center md:w-auto">
					<Button
						variant="outline"
						onClick={() => router.push('/login')}
						className="flex w-full items-center md:w-auto"
					>
						<ArrowLeft className="mr-2" />
						Log in
					</Button>
				</CardAction>
			</Card>
		)
	}

	return (
		<Card className="mt-4 rounded border p-4">
			<CardTitle className="text-center">
				<h2 className="font-semibold text-lg">User Information</h2>
			</CardTitle>
			<CardContent className="flex flex-col items-center gap-2">
				<p>
					<strong>Name:</strong> {isLoggedIn.name || 'N/A'}
				</p>
				<p>
					<strong>Email:</strong> {isLoggedIn.email || 'N/A'}
				</p>
				<p>
					<strong>Role:</strong> {isLoggedIn.role || 'N/A'}
				</p>
			</CardContent>
		</Card>
	)
}
