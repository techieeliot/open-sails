'use client'

import { useAtomValue } from 'jotai'
import { LayoutDashboard, LogIn, LogOut, Settings, User } from 'lucide-react'
import Link from 'next/link'

import { userSessionAtom } from '@/lib/atoms'

export const UserMenu = () => {
	const userSession = useAtomValue(userSessionAtom)
	// Simulate authentication state
	return (
		<nav className="flex h-20 min-w-xs items-center justify-around gap-8 px-12">
			<Link href="/dashboard">
				<LayoutDashboard className="mr-2" />
				<span className="hidden md:inline">Dashboard</span>
			</Link>
			{userSession.user ? (
				<>
					<Link href="/profile">
						<User className="mr-2" />
						<span className="hidden md:inline">Profile</span>
					</Link>
					<Link href="/settings">
						<Settings className="mr-2" />
						<span className="hidden md:inline">Settings</span>
					</Link>
					<Link href="/logout">
						<LogOut className="mr-2" />
						<span className="hidden md:inline">Logout</span>
					</Link>
				</>
			) : (
				<Link href="/login">
					<LogIn className="mr-2" />
					<span className="hidden md:inline">Login</span>
				</Link>
			)}
		</nav>
	)
}
