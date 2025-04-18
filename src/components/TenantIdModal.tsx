
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TenantIdModalProps {
  currentTenantId: string;
  onTenantIdChange: (newTenantId: string) => void;
}

const TenantIdModal = ({ currentTenantId, onTenantIdChange }: TenantIdModalProps) => {
  const [tenantId, setTenantId] = React.useState(currentTenantId);
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onTenantIdChange(tenantId);
    setOpen(false);
    toast({
      title: "Tenant ID Updated",
      description: "Your tenant ID has been successfully updated.",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="absolute top-4 right-4 gap-2"
        >
          <Settings2 className="h-4 w-4" />
          Set Tenant ID
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Set Tenant ID</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter tenant ID"
            value={tenantId}
            onChange={(e) => setTenantId(e.target.value)}
            className="col-span-3"
          />
          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default TenantIdModal;
