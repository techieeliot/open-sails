'use client';

import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmationDialog } from '@/components/confirmation-dialog';

interface DeleteCollectionDialogProps {
  collectionId: number;
  onSuccess?: () => void;
}

/**
 * Delete Collection Dialog Component
 *
 * A reusable dialog for deleting collections with confirmation.
 * Follows best practices for component composition and error handling.
 */
export default function DeleteCollectionDialog({
  collectionId,
  onSuccess,
}: DeleteCollectionDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!collectionId || isDeleting) return;

    try {
      setIsDeleting(true);

      const response = await fetch(`/api/collections/${collectionId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Show success toast with more details
        toast.success('Collection deleted successfully', {
          description: 'The collection has been removed from your listings.',
          duration: 3000,
        });

        if (onSuccess) {
          onSuccess();
        }
      } else {
        const errorData = await response.text();
        toast.error('Failed to delete collection', {
          description: errorData || 'An unknown error occurred',
        });
      }
    } catch (error) {
      console.error('Error deleting collection:', error);
      toast.error('Failed to delete collection', {
        description: 'Please try again later',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <ConfirmationDialog
      triggerText="Delete"
      triggerIcon={Trash2}
      triggerVariant="destructive"
      triggerAriaLabel="open dialog to confirm collection deletion"
      dialogTitle="Delete Collection"
      dialogDescription="Are you sure you want to delete this collection?"
      onConfirm={handleDelete}
    />
  );
}
