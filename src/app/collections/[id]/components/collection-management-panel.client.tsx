'use client';

import { DynamicInputDialog } from '@/app/dashboard/components/dynamic-input-dialog';
import { ConfirmationDialog } from '@/components/confirmation-dialog';
import { Card, CardContent } from '@/components/ui/card';
import { DELETE } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export const CollectionAdminPanel = ({ id }: { id: number }) => {
  const router = useRouter();
  const [isOwner] = useState(true);

  return (
    <section>
      {isOwner ? (
        <div>
          <Card className="flex w-full justify-center items-center gap-4">
            <CardContent className="flex flex-col">
              <div className="flex w-full justify-end">
                <DynamicInputDialog
                  key={`edit-dialog-${id}`}
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
                  key={`delete-dialog-${id}`}
                  triggerText="Delete"
                  dialogTitle="Delete Collection"
                  description="Are you sure you want to delete this collection?"
                  onConfirm={async () => {
                    console.log('Delete Collection clicked');
                    try {
                      const removalConfirmationResponse = await fetch(`/api/collections`, {
                        method: DELETE,
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ id }),
                      });
                      if (!removalConfirmationResponse.ok) {
                        throw new Error('Failed to delete collection');
                      }

                      console.log('Collection deleted successfully');
                      toast.success('Collection deleted successfully', {
                        duration: 5000,
                      });
                      router.push('/dashboard');
                    } catch (error) {
                      toast.error('Failed to delete collection', {
                        description: 'Please try again later',
                        duration: 5000,
                      });
                      console.error('Failed to delete collection:', error);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="text-center text-muted-foreground">
          <p>You do not have permission to manage this collection.</p>
          <div className="flex w-full justify-end">
            <DynamicInputDialog
              key={`bid-dialog-${id}`}
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
