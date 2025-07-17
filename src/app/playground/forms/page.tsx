import { BidForm } from '@/app/dashboard/components/bid-form';
import { CollectionForm } from '@/app/dashboard/components/collection-form';
import { LoginForm } from '@/components/login-form';
import PageWrapper from '@/components/page-wrapper';
import { FormWrapper } from '@/components/ui/form';

export default function PlaygroundFormsPage() {
  return (
    <PageWrapper>
      <div className="flex flex-col items-center gap-10 min-h-screen bg-background text-foreground">
        <h1 className="text-3xl font-bold mb-2">Playground For Forms</h1>
        <p className="mb-6 text-lg opacity-80">This is a playground for testing forms.</p>
        <div className="flex flex-col flex-wrap gap-4 justify-center w-full">
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
