import { BidForm } from '@/app/dashboard/components/bid-form';
import { CollectionForm } from '@/app/dashboard/components/collection-form';
import { LoginForm } from '@/components/login-form';
import PageWrapper from '@/components/page-wrapper';
import { FormWrapper } from '@/components/ui/form';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Forms - Open Sails',
  description: 'A playground for testing different form styles and states',
};

export default function PlaygroundFormsPage() {
  return (
    <PageWrapper>
      <div className="flex min-h-screen flex-col items-center gap-10 bg-background text-foreground">
        <h1 className="mb-2 font-bold text-3xl">Playground For Forms</h1>
        <p className="mb-6 text-lg opacity-80">This is a playground for testing forms.</p>
        <div className="flex w-full flex-col flex-wrap justify-center gap-4">
          <FormWrapper>
            <LoginForm />
          </FormWrapper>
          <FormWrapper>
            <BidForm method="POST" />
          </FormWrapper>
          <FormWrapper>
            <BidForm method="PUT" bidId={1} />
          </FormWrapper>
          <FormWrapper>
            <CollectionForm method="POST" />
          </FormWrapper>
          <FormWrapper>
            <CollectionForm method="PUT" collectionId={1} />
          </FormWrapper>
        </div>
      </div>
    </PageWrapper>
  );
}
