import PageWrapper from '@/components/page-wrapper';
import CollectionsIndex from '@/components/collections-index';
import { DashboardModal } from './components/dashboard-modal';

export default function DashboardPage() {
  return (
    <PageWrapper>
      <section className="flex flex-col items-center gap-8 min-w-lg">
        <div className="flex w-full justify-end max-w-8xl">
          <DashboardModal
            triggerText="Create Collection"
            modalTitle="Create Collection"
            description="Fill out the form to create a new collection."
            modalType="collection"
            method="POST"
          />
        </div>
        <CollectionsIndex />
      </section>
    </PageWrapper>
  );
}
