import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import type { ReactNode } from 'react'
import { Toaster } from 'sonner'

import AppFooter from '@/components/app-footer'
import BottomNavigation from '@/components/bottom-navigation'
import ErrorBoundary from '@/components/error-boundary'
import HeaderNavigation from '@/components/header-navigation.tsx'
import JotaiProvider from '@/components/providers/jotai-provider'
import { cn } from '@/lib/utils'

import { Analytics } from '@vercel/analytics/next'

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
})

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
})

export const metadata: Metadata = {
	title: 'Open Sails',
	description: 'A platform for managing bids and collections',
}

export default function RootLayout({
	children,
}: Readonly<{
	children: ReactNode
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				suppressHydrationWarning
				className={cn(geistSans.variable, geistMono.variable, 'antialiased', 'dark')}
			>
				<ErrorBoundary>
					<JotaiProvider>
						<HeaderNavigation />
						{/* PAGE CONTENT */}
						{children}
						<AppFooter />
						<BottomNavigation />
					</JotaiProvider>
				</ErrorBoundary>
				<Toaster position="top-center" richColors />
				<Analytics />
			</body>
		</html>
	)
}
