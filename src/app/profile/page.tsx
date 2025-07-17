import PageWrapper from '@/components/page-wrapper';
import UserInfo from './components/user-info.client';

export default function ProfilePage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center gap-10 min-h-screen bg-background text-foreground mt-6 w-full max-w-sm">
        <h1 className="text-3xl font-bold mb-2">Profile</h1>
        <p className="mb-6 text-lg opacity-80">View and manage your profile information.</p>
        <UserInfo />
      </div>
    </PageWrapper>
  );
}
