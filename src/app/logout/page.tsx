import PageWrapper from '@/components/page-wrapper';
import { UserLogoutHandler } from './logout-handler-client';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Logout - Open Sails',
  description: 'User logout page for Open Sails',
};
export default function LogoutPage() {
  return (
    <PageWrapper>
      <UserLogoutHandler />
    </PageWrapper>
  );
}
