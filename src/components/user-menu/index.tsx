'use client'

import { useAtomValue } from 'jotai'
import { LogIn, LogOut, Rocket, Settings, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { userSessionAtom } from '@/lib/atoms'

export const UserMenu = () => {
	// Simulate authentication state
	const userSession = useAtomValue(userSessionAtom)
	const { user: isLoggedIn } = userSession

	const path = usePathname()
	return (
		<nav className="static right-0 bottom-0 left-0 z-50 flex h-20 w-full min-w-xs items-center justify-around gap-8 overscroll-y-none md:fixed md:px-12 [&>a]:flex [&>a]:flex-col [&>a]:items-center [&>a]:justify-center">
			<Link href="/dashboard">
				<Rocket className="mr-2" />
				<span className="hidden text-xs md:inline md:text-base">Dashboard</span>
			</Link>
			{isLoggedIn ? (
				<>
					<Link href="/profile" className="hidden md:inline">
						<User className="mr-2" />
						<span className="text-xs md:inline md:text-base">Profile</span>
					</Link>
					<Link href="/settings" className="inline">
						<Settings className="mr-2" />
						<span className="text-xs md:inline md:text-base">Settings</span>
					</Link>
					<Link href="/logout" className="inline">
						<LogOut className="mr-2" />
						<span className="text-xs md:inline md:text-base">Logout</span>
					</Link>
				</>
			) : (
				path !== '/login' && (
					<Link href="/login" className="hidden md:inline">
						<LogIn className="mr-2" />
						<span className="text-xs md:inline md:text-base">Login</span>
					</Link>
				)
			)}
		</nav>
	)
}
