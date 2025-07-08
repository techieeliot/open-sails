import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const PopupModal = () => {
  return (
    <Dialog>
      <DialogTrigger className="btn btn-primary">Open Popup</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Popup Title</DialogTitle>
          <DialogDescription>
            This is a popup modal description.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => console.log("Action confirmed")}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
