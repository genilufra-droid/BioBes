import { Eye, Pencil, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type FlowAction = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
};

type DocumentActionsModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentNumber: string;
  onOpen: () => void;
  onEdit?: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canCancel?: boolean;
  canDelete?: boolean;
  flowAction?: FlowAction;
};

export default function DocumentActionsModal({
  open,
  onOpenChange,
  documentNumber,
  onOpen,
  onEdit,
  onCancel,
  onDelete,
  canEdit = false,
  canCancel = false,
  canDelete = false,
  flowAction,
}: DocumentActionsModalProps) {
  const closeThen = (action: () => void) => {
    action();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Veprime — {documentNumber}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 pt-1">
          <Button variant="outline" className="justify-start" onClick={() => closeThen(onOpen)}>
            <Eye className="mr-2 h-4 w-4" />Hap dokumentin
          </Button>
          {flowAction && (
            <Button className="justify-start bg-[#714b67] text-white hover:bg-[#5f3d58]" disabled={flowAction.disabled} onClick={() => closeThen(flowAction.onClick)}>
              {flowAction.label}
            </Button>
          )}
          {canEdit && onEdit && (
            <Button variant="outline" className="justify-start" onClick={() => closeThen(onEdit)}>
              <Pencil className="mr-2 h-4 w-4" />Modifiko
            </Button>
          )}
          {canCancel && onCancel && (
            <Button variant="outline" className="justify-start border-amber-300 text-amber-800 hover:bg-amber-50" onClick={() => closeThen(onCancel)}>
              <XCircle className="mr-2 h-4 w-4" />Anulo
            </Button>
          )}
          {canDelete && onDelete && (
            <Button variant="outline" className="justify-start border-red-300 text-red-700 hover:bg-red-50" onClick={() => closeThen(onDelete)}>
              <Trash2 className="mr-2 h-4 w-4" />Fshij
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
