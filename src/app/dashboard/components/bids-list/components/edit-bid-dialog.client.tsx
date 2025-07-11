'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bid } from '@/types';
import { useRouter } from 'next/navigation';

interface EditBidDialogProps {
  bid: Bid;
  onBidUpdated: () => void;
}

export function EditBidDialog({ bid, onBidUpdated }: EditBidDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [newPrice, setNewPrice] = useState(bid.price);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPrice <= 0) {
      toast.error('Invalid bid amount', {
        description: 'Bid price must be greater than zero',
        duration: 3000,
      });
      return;
    }

    if (newPrice === bid.price) {
      toast.warning('No changes made', {
        description: 'The bid amount is the same as before',
        duration: 3000,
      });
      return;
    }

    if (newPrice < bid.price) {
      // Show a confirmation dialog for lowering the bid
      if (!confirm('You are lowering your bid amount. Continue?')) {
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/bids?bid_id=${bid.id}&collection_id=${bid.collectionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          price: newPrice,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Failed to update bid');
      }

      toast.success('Bid updated successfully', {
        description: `Your bid price has been changed to $${newPrice.toLocaleString()}`,
        duration: 5000,
        action: {
          label: 'View Bid Details',
          onClick: () => {
            // Navigate to the bid details page
            router.push(`/bids/${bid.id}`);
          },
        },
      });
      onBidUpdated();
      setOpen(false);
    } catch (error) {
      console.error('Error updating bid:', error);
      toast.error('Failed to update bid', {
        description: error instanceof Error ? error.message : 'Please try again later',
        duration: 5000,
        action: {
          label: 'Dismiss',
          onClick: () => {},
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogChange = (isOpen: boolean) => {
    // If dialog is closing and price has changed, show confirmation
    if (!isOpen && open && newPrice !== bid.price && !isSubmitting) {
      const confirmClose = confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmClose) {
        return; // Don't close the dialog
      }
    }

    // Reset form state when closing the dialog
    if (!isOpen && open) {
      setNewPrice(bid.price);
    }

    setOpen(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Edit Bid
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Your Bid</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="price">New Bid Price ($)</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0.01"
              value={newPrice}
              onChange={(e) => setNewPrice(Number(e.target.value))}
              placeholder="Enter new bid amount"
              required
            />
            <p className="text-sm text-muted-foreground">
              Enter your new bid price. It should be higher than your previous bid.
            </p>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Bid'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
