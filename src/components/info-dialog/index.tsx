'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { DialogModalProps } from '@/types';
import { cloneElement, isValidElement, PropsWithChildren, ReactElement, useState } from 'react';

export const InfoDialog = ({
  triggerText,
  dialogTitle,
  description,
  children,
  ...props
}: PropsWithChildren<DialogModalProps>) => {
  const [open, setOpen] = useState(false);

  const closeDialog = () => setOpen(false);

  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {isValidElement(children)
          ? cloneElement(children as ReactElement<{ closeDialog: () => void }>, { closeDialog })
          : children}
      </DialogContent>
    </Dialog>
  );
};
