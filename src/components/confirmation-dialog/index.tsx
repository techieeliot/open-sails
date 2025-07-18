'use client';

import { useId, useState } from 'react';

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import type { DialogModalProps } from '@/types';

import TriggerIconButton from '../trigger-icon-button';

interface ConfirmationDialogProps extends DialogModalProps {
  onConfirm: () => void;
}

export const ConfirmationDialog = ({
  onConfirm,
  triggerText,
  dialogTitle,
  dialogDescription,
  triggerVariant = 'outline',
  triggerAriaLabel,
  triggerIcon,
  ...props
}: ConfirmationDialogProps) => {
  const titleId = useId();
  const descId = useId();
  const [open, setOpen] = useState(false);

  return (
    <AlertDialog open={open} onOpenChange={setOpen} {...props}>
      <AlertDialogTrigger asChild>
        <TriggerIconButton
          type="button"
          variant={triggerVariant}
          icon={triggerIcon}
          aria-label={triggerAriaLabel || 'Open confirmation dialog'}
          size="sm"
          title={dialogTitle || 'Confirmation Dialog'}
        >
          {triggerText}
        </TriggerIconButton>
      </AlertDialogTrigger>
      <AlertDialogContent
        className="mx-auto max-w-md p-6"
        aria-labelledby={titleId}
        aria-describedby={descId}
        autoFocus
      >
        <AlertDialogHeader className="flex min-h-32 flex-col items-center justify-center text-center">
          <AlertDialogTitle id={titleId}>{dialogTitle || 'Confirmation'}</AlertDialogTitle>
          {dialogDescription ? (
            <AlertDialogDescription id={descId}>{dialogDescription}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex min-h-32 gap-4">
          <AlertDialogCancel asChild>
            <Button type="button" onClick={() => setOpen(false)} size="sm" className="w-2xs">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              type="button"
              onClick={() => {
                onConfirm();
                setOpen(false);
              }}
              size="sm"
              className="w-2xs"
            >
              Confirm
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
