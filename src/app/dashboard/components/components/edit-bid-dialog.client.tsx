'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Edit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import TriggerIconButton from '@/components/trigger-icon-button';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Form, FormDescription, FormField, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { API_METHODS } from '@/lib/constants';
import { parseNumeric } from '@/lib/utils';
import { Bid } from '@/types';

interface EditBidDialogProps {
  bid: Bid;
  onBidUpdated: () => void;
}

export function EditBidDialog({ bid, onBidUpdated }: EditBidDialogProps) {
  const [open, setOpen] = useState(false);
  const bidPrice = parseNumeric(bid.price);
  const [newPrice, setNewPrice] = useState(bidPrice);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schema = z.object({
    price: z
      .number()
      .min(bidPrice + 0.01, `New bid must be greater than current bid $${bidPrice + 0.01}`),
  });

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      price: bidPrice,
    },
  });

  const handleDialogChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setNewPrice(bidPrice); // Reset price when dialog is closed
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (newPrice <= bidPrice) {
      toast.error('New bid price must be greater than the current bid.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/bids?bid_id=${bid.id}&collection_id=${bid.collectionId}`, {
        method: API_METHODS.PUT,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ price: newPrice.toString() }),
      });

      if (!response.ok) {
        throw new Error('Failed to update bid');
      }

      toast.success('Bid updated successfully');
      onBidUpdated();
      setOpen(false);
    } catch (error) {
      console.error('Error updating bid:', error);
      toast.error('Failed to update bid');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <TriggerIconButton
          icon={Edit}
          size="sm"
          aria-label="open dialog to edit bid"
          variant="outline"
          onClick={() => handleDialogChange(true)}
        >
          Edit
        </TriggerIconButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Your Bid</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Current Bid: ${bidPrice.toLocaleString()}
          </DialogDescription>
        </DialogHeader>
        {/* use react hook form */}
        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label htmlFor="price">New Bid Price</Label>
                  <FormDescription className="text-sm text-muted-foreground">
                    New Bid must be greater than ${bidPrice + 0.01}
                  </FormDescription>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    min={bidPrice + 0.01}
                    {...field}
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value))}
                  />
                </div>
              )}
            />
            <FormMessage />

            <DialogFooter className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => handleDialogChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Updating...' : 'Update Bid'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
