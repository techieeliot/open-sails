import PageWrapper from '@/components/page-wrapper';
import type { Metadata } from 'next';
import DialogSuite from './dialog-suite';

export const metadata: Metadata = {
  title: 'Dialogs - Open Sails',
  description: 'A playground for testing different dialog styles and states',
};

export default function PlaygroundDialogsPage() {
  return (
    <PageWrapper>
      <div className="flex min-h-screen flex-col items-center gap-10 bg-background text-foreground">
        <h1 className="mb-2 font-bold text-3xl">Playground Dialogs</h1>
        <p className="mb-6 text-lg opacity-80">This is a playground for testing dialogs.</p>
        <div className="flex w-full flex-col flex-wrap justify-center gap-4">
          <DialogSuite />
        </div>
      </div>
    </PageWrapper>
  );
}
