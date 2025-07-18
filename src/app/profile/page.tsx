import PageWrapper from '@/components/page-wrapper';

import UserInfo from './components/user-info.client';
import { UserRoundCog } from 'lucide-react';

export default function ProfilePage() {
  return (
    <PageWrapper>
      <div className="flex min-h-[80vh] w-full max-w-md flex-col items-center justify-center gap-8 px-4 py-8 sm:py-12 mx-auto bg-background text-foreground rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <UserRoundCog className="h-10 w-10 text-primary mb-2" />
          <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl text-center mb-1">
            Settings
          </h1>
          <p className="text-base sm:text-lg opacity-80 text-center mb-4">
            Manage your profile (coming soon)
          </p>
        </div>
        <div className="w-full flex justify-center">
          <UserInfo />
        </div>
      </div>
    </PageWrapper>
  );
}
