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
      <DialogTrigger className="btn btn-primary">{triggerText}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter>
          <Button type="button" onClick={onConfirm}>
            Confirm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
