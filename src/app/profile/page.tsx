import PageWrapper from '@/components/page-wrapper';
import UserInfo from './components/user-info.client';

export default function ProfilePage() {
  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold mb-4">Profile Page</h1>
      <UserInfo />
    </PageWrapper>
  );
}
