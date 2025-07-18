import PageWrapper from '@/components/page-wrapper'

import { UserLogoutHandler } from './logout-handler-client'

export default function LogoutPage() {
	// This page is for logging out users. It can be used to display a message or redirect them.
	// In a real application, you would also handle the logout logic here, such as clearing
	// authentication tokens or session data.
	return (
		<PageWrapper>
			<UserLogoutHandler />
		</PageWrapper>
	)
}
