'use client';

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export const CollectionAdminPanel = ({ id }: { id: number }) => {
  const router = useRouter();
  const [isOwner, setIsOwner] = useState(true);

  return (
    <section>
      {isOwner ? (
        <div>
          <div className="flex w-full justify-end">
            <DynamicInputDialog
              triggerText="Edit"
              dialogTitle="Edit Collection"
              description="Fill out the form to edit the collection."
              modalCategory="collection"
              method="PUT"
              collectionId={id}
            />
          </div>
          <div className="flex w-full justify-end">
            <ConfirmationDialog
              triggerText="Delete"
              dialogTitle="Delete Collection"
              description="Are you sure you want to delete this collection?"
              onConfirm={async () => {
                console.log('Delete Collection clicked');
                try {
                  const removalConfirmationResponse = await fetch(`/api/collections`, {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id }),
                  });
                  if (!removalConfirmationResponse.ok) {
                    throw new Error('Failed to delete collection');
                  }

                  console.log('Collection deleted successfully');
                  alert('Collection deleted successfully');
                  router.push('/dashboard');
                } catch (error) {
                  console.error('Failed to delete collection:', error);
                }
              }}
            />
          </div>
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          <p>You do not have permission to manage this collection.</p>
          <div className="flex w-full justify-end">
            <DynamicInputDialog
              triggerText="Place Bid"
              dialogTitle="Place a Bid"
              description="Fill out the form to place a bid on this collection."
              modalCategory="bid"
              method="POST"
              collectionId={id}
            />
          </div>
        </div>
      )}
    </section>
  );
};
