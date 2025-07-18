import { MainHeaderNav, ResponsiveHeaderNavigation } from './components'

export default function HeaderNavigation() {
	return (
		<header className="fixed z-50 w-full bg-zinc-100 dark:bg-zinc-900">
			<MainHeaderNav />
			<ResponsiveHeaderNavigation />
		</header>
	)
}
