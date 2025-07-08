import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export const ItemModal = ({
  triggerText = "Create",
  title = "Create Item",
  description = "Create a new item.",
  children,
}: {
  triggerText?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
}) => {
  return (
    <Dialog>
      <DialogTrigger className="btn btn-primary">{triggerText}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        {children}
      </DialogContent>
    </Dialog>
  );
};
