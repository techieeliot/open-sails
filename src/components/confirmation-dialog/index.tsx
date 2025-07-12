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
import { DialogModalProps } from '@/types';
import { ReactNode } from 'react';

interface ConfirmationDialogProps extends DialogModalProps {
  onConfirm: () => void;
  triggerText: ReactNode;
  dialogTitle: ReactNode;
  description?: string;
}

export const ConfirmationDialog = ({
  onConfirm,
  triggerText,
  dialogTitle,
  description,
  ...props
}: ConfirmationDialogProps) => {
  return (
    <AlertDialog {...props}>
      <AlertDialogTrigger asChild>
        <Button type="button" variant="outline">
          {triggerText}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md mx-auto p-6">
        <AlertDialogHeader className="text-center flex flex-col justify-center items-center min-h-32">
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter className="flex min-h-32">
          <AlertDialogCancel asChild>
            <Button type="button" variant="secondary" className="w-2xs">
              Cancel
            </Button>
          </AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button type="button" onClick={onConfirm} size="icon" className="w-2xs">
              Confirm
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
