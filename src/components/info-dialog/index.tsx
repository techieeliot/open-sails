'use client';

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
import { PropsWithChildren, useId, useState } from 'react';
import TriggerIconButton from '../trigger-icon-button';

export const InfoDialog = ({
  triggerText,
  dialogTitle,
  dialogDescription,
  triggerVariant = 'outline',
  triggerAriaLabel,
  triggerIcon,
  children,
  ...props
}: PropsWithChildren<DialogModalProps>) => {
  const [open, setOpen] = useState(false);
  const titleId = useId();
  const descId = useId();

  return (
    <Dialog open={open} onOpenChange={setOpen} {...props}>
      <DialogTrigger asChild>
        <TriggerIconButton
          type="button"
          variant={triggerVariant}
          size="sm"
          aria-label={triggerAriaLabel}
          icon={triggerIcon}
          title={dialogTitle || 'Information Dialog'}
        >
          {triggerText}
        </TriggerIconButton>
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
