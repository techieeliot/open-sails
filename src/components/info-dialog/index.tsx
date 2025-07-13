'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { DialogModalProps } from '@/types';
import { HTMLAttributes, isValidElement, PropsWithChildren, useId, useState } from 'react';

export const InfoDialog = ({
  triggerText,
  dialogTitle,
  dialogDescription,
  triggerVariant = 'outline',
  children,
  ...props
}: PropsWithChildren<DialogModalProps>) => {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descId = useId();
  const dialogTitleText =
    dialogTitle !== null && isValidElement(dialogTitle) && dialogTitle.props
      ? (dialogTitle.props as HTMLAttributes<HTMLElement>).children
      : dialogTitle;

  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant={triggerVariant}
          size="sm"
          aria-label={`Open ${dialogTitleText || 'info'} dialog`}
        >
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-lg mx-auto flex flex-col items-center justify-center"
        aria-labelledby={titleId}
        aria-describedby={dialogDescription ? descId : undefined}
        autoFocus
      >
        <DialogHeader className="text-center">
          <DialogTitle id={titleId}>{dialogTitle || 'Information'}</DialogTitle>
          {dialogDescription ? (
            <DialogDescription id={descId}>{dialogDescription}</DialogDescription>
          ) : null}
        </DialogHeader>
        <DialogFooter>{children}</DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
