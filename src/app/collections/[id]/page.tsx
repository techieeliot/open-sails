import { getCollectionById, getCollections } from '@/app/api/collections/utils';
import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import PageWrapper from '@/components/page-wrapper';
import { Button } from '@/components/ui/button';
import { CollectionAdminPanel } from './components/collection-management-panel';

export default async function CollectionDetailsPage({ params }: { params: { id: string } }) {
  const parsedId = Number(params?.id);

  if (isNaN(parsedId)) {
    return (
      <PageWrapper>
        <h1 className="text-2xl font-bold mb-4">Invalid Collection ID</h1>
        <p className="text-red-500">The provided collection ID is not a valid number.</p>
      </PageWrapper>
    );
  }

  const collection = await getCollectionById(parsedId);

  return (
    <PageWrapper>
      <div className="flex flex-col gap-4 w-full max-w-8xl items-end justify-end">
        {collection ? (
          <div className="w-full">
            <h1 className="text-2xl font-bold mb-4">{collection.name}</h1>
            <p className="mb-2">Description: {collection.descriptions}</p>
            <p className="mb-2">Status: {collection.status}</p>
          </div>
        ) : (
          <p>Collection not found yet...</p>
        )}
      </div>
      <CollectionAdminPanel id={parsedId} />
    </PageWrapper>
  );
}
