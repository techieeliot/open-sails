import PageWrapper from '@/components/page-wrapper';
import { Settings as SettingsIcon, ToggleLeft } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings - Open Sails',
  description: 'User settings page for Open Sails',
};

export default function SettingsPage() {
  return (
    <PageWrapper>
      <div className="flex min-h-[70vh] w-full max-w-md flex-col items-center justify-center gap-8 px-4 py-8 sm:py-12 mx-auto text-foreground rounded-lg shadow-lg">
        <div className="flex flex-col items-center gap-2">
          <SettingsIcon className="h-10 w-10 text-primary mb-2" />
          <h1 className="font-extrabold text-2xl sm:text-3xl md:text-4xl text-center mb-1">
            Settings
          </h1>
          <p className="text-base sm:text-lg opacity-80 text-center mb-4">
            Personalize your experience (coming soon)
          </p>
        </div>
        <div className="w-full max-w-xs mx-auto bg-zinc-900/80 rounded-lg p-6 flex flex-col items-center gap-4 border border-zinc-800 shadow">
          <div className="flex items-center justify-between w-full">
            <span className="text-zinc-200 font-medium">Dark Mode</span>
            <button disabled className="flex items-center gap-2 cursor-not-allowed opacity-60">
              <ToggleLeft className="h-6 w-6" />
              <span className="text-xs">Coming soon</span>
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
