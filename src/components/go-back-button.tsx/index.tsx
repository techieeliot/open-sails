'use client'

import { useRouter } from 'next/navigation'
import type { ComponentProps } from 'react'

import { Button } from '../ui/button'

export default function GoBackButton({
	children = 'Go Back',
	icon: Icon,
	...props
}: { icon?: React.ElementType } & ComponentProps<typeof Button>) {
	const router = useRouter()

	return (
		<Button onClick={() => router.back()} {...props}>
			{Icon && (
				<span className="mr-2">
					<Icon />
				</span>
			)}
			{children}
		</Button>
	)
}
