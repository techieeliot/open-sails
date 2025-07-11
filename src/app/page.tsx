import PageWrapper from '@/components/page-wrapper';
import { UserAccessSwitcher } from './user-access-switcher.client';
import Image from 'next/image';

export default function Home() {
  return (
    <PageWrapper>
      {/* animation */}
      <div className="flex flex-col items-center justify-center max-h-96 gap-8 ">
        <div className="flex flex-col items-center">
          <Image src="/logo.png" width={400} height={400} alt="Open Sails Logo" />
        </div>
        <h1>
          <span className="text-4xl font-bold ">Welcome to Open Sails</span>
        </h1>
        <p className="mt-4 text-lg">A platform for managing bids and crypto mining collections</p>
        <UserAccessSwitcher />
      </div>
    </PageWrapper>
  );
}
