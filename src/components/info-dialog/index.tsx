'use client';

import { type PropsWithChildren, useId, useState } from 'react';

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { DialogModalProps } from '@/types';

import TriggerIconButton from '../trigger-icon-button';

export const InfoDialog = ({
  triggerText,
  dialogTitle,
  dialogDescription,
  triggerVariant = 'outline',
  triggerAriaLabel,
  triggerIcon,
  fullWidthTrigger = false,
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
          fullWidth={fullWidthTrigger}
        >
          {triggerText}
        </TriggerIconButton>
      </DialogTrigger>
      <DialogContent className="mx-auto flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden">
        <DialogHeader className="text-center pt-6 px-6 pb-4 shrink-0">
          <DialogTitle id={titleId}>{dialogTitle || 'Information'}</DialogTitle>
          {dialogDescription ? (
            <DialogDescription id={descId}>{dialogDescription}</DialogDescription>
          ) : null}
        </DialogHeader>
        <ScrollArea className="flex-1 w-full">
          <section className="px-6 pb-6">{children}</section>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
