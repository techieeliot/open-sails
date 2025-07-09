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
import { PropsWithChildren } from 'react';

export const InfoDialog = ({
  triggerText,
  dialogTitle,
  description,
  children,
  ...props
}: PropsWithChildren<DialogModalProps>) => {
  return (
    <Dialog {...props}>
      <DialogTrigger className="btn btn-primary">{triggerText}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
