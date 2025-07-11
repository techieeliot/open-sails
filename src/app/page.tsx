import PageWrapper from '@/components/page-wrapper';
import { UserAccessSwitcher } from './user-access-switcher.client';

export default function Home() {
  return (
    <PageWrapper>
      <header className="flex items-center justify-center p-8">
        <h1 className="font-bold">Open Sails</h1>
      </header>
      <UserAccessSwitcher />
    </PageWrapper>
  );
}
