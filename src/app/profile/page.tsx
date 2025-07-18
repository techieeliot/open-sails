import PageWrapper from '@/components/page-wrapper'

import UserInfo from './components/user-info.client'

export default function ProfilePage() {
	return (
		<PageWrapper>
			<div className="mt-6 flex min-h-screen w-full max-w-sm flex-col items-center gap-10 bg-background text-foreground">
				<h1 className="mb-2 font-bold text-3xl">Profile</h1>
				<p className="mb-6 text-lg opacity-80">View and manage your profile information.</p>
				<UserInfo />
			</div>
		</PageWrapper>
	)
}
