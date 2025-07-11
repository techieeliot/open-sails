import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DialogModalProps } from '@/types';

interface ConfirmationDialogProps extends DialogModalProps {
  onConfirm: () => void;
}

export const ConfirmationDialog = ({
  triggerText,
  dialogTitle,
  description,
  onConfirm,
  ...props
}: ConfirmationDialogProps) => {
  return (
    <Dialog {...props}>
      <DialogTrigger asChild>
        <Button variant="outline">{triggerText}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md mx-auto p-6">
        <DialogHeader className="text-center flex flex-col justify-center items-center min-h-32">
          <DialogTitle>{dialogTitle}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="flex min-h-32">
          <Button type="button" onClick={onConfirm} size="icon" className="w-2xs">
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
