import PageWrapper from '@/components/page-wrapper';

export default function LogoutPage() {
  // This page is for logging out users. It can be used to display a message or redirect them.
  // In a real application, you would also handle the logout logic here, such as clearing
  // authentication tokens or session data.
  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-4">Logout Page</h1>
      <p className="text-lg">You have been logged out.</p>
    </PageWrapper>
  );
}
