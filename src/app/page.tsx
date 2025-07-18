import Image from 'next/image';

import PageWrapper from '@/components/page-wrapper';

import { UserAccessSwitcher } from './user-access-switcher.client';

export default function Home() {
  return (
    <PageWrapper>
      <div className="relative flex min-h-[80vh] flex-col items-center justify-center gap-8 px-4 py-8 sm:py-16 md:py-24">
        <div className="flex flex-col items-center w-full">
          <Image
            src="/logo.png"
            width={0}
            height={0}
            sizes="100vw"
            className="h-32 w-32 sm:h-48 sm:w-48 md:h-64 md:w-64 lg:h-80 lg:w-80 object-contain drop-shadow-xl mb-4 transition-all duration-300"
            alt="Open Sails Logo"
          />
        </div>
        <h1 className="text-center font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-white drop-shadow-lg tracking-tight">
          Welcome to <span className="text-primary">Open Sails</span>
        </h1>
        <p className="mt-2 text-center text-base sm:text-lg md:text-xl text-zinc-300 max-w-xl">
          A platform for managing bids and crypto mining collections
        </p>
        <div className="w-full flex justify-center mt-4">
          <UserAccessSwitcher />
        </div>
      </div>
    </PageWrapper>
  );
}
