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
        <Button type="button" variant="outline" size="sm">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg mx-auto flex flex-col items-center justify-center">
        <DialogHeader className="text-center">
          <DialogTitle className="p-24">{dialogTitle}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {isValidElement(children) && typeof children.type !== 'string'
          ? cloneElement(children as React.ReactElement<any>, { closeDialog })
          : children}
      </DialogContent>
    </Dialog>
  );
};
