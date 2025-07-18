'use client'

import { useAtomValue } from 'jotai'
import { LogOut, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { UserMenu } from '@/components/user-menu'
import { userSessionAtom } from '@/lib/atoms'

export const MainHeaderNav = () => (
	<div className="flex items-center justify-between shadow-md">
		<div className="min-w-xl">
			<nav className="hidden h-20 items-center md:flex md:px-12">
				<Link href="/" className="flex items-center justify-center font-bold text-2xl">
					<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md transition-shadow duration-300 hover:shadow-lg dark:bg-gray-800">
						<Image src="/logo.png" alt="Logo" width={40} height={40} className="h-auto w-auto" />
					</div>
					<span className="hidden min-w-32 md:inline">Open Sails</span>
				</Link>
			</nav>
		</div>

		<UserMenu />
	</div>
)

export const ResponsiveHeaderNavigation = () => {
	// Simulate authentication state
	const userSession = useAtomValue(userSessionAtom)
	const { user } = userSession
	const path = usePathname()
	return (
		<nav className="flex h-20 w-full justify-between p-0 md:hidden">
			{user ? (
				<>
					<Link href="/profile" className="inline md:hidden">
						<User className="mr-2" />
						<span className="text-xs md:inline md:text-base">Profile</span>
					</Link>
					<Link href="/" className="inline md:hidden">
						<Image src="/logo.png" alt="Logo" width={40} height={40} className="h-auto w-auto" />
					</Link>
					<Link href="/logout" className="inline md:hidden">
						<LogOut className="mr-2" />
						<span className="text-xs md:inline md:text-base">Logout</span>
					</Link>
				</>
			) : (
				path !== '/' && (
					<Link href="/" className="inline md:hidden">
						<Image src="/logo.png" alt="Logo" width={40} height={40} className="h-auto w-auto" />
					</Link>
				)
			)}
		</nav>
	)
}
