"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Smartphone, Signal, Edit2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PhoneLine = {
  id: number;
  phoneNumber: string;
  carrier: string | null;
  deviceLabel: string | null;
  simIccid: string | null;
  forwardingTo: string | null;
  forwardingActive: boolean;
  assignedToApplicationId: number | null;
  assignedToCompanyId: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  applicationName?: string;
};

const emptyForm = {
  carrier: "",
  deviceLabel: "",
  forwardingTo: "",
  forwardingActive: false,
  notes: "",
};

export default function PhonesPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingPhone, setEditingPhone] = useState<PhoneLine | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data: phones = [], isLoading } = useQuery<PhoneLine[]>({
    queryKey: ["phones"],
    queryFn: () => fetch("/api/phones").then((r) => r.json()),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof emptyForm & { id: number }) =>
      fetch(`/api/phones/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phones"] });
      setSheetOpen(false);
      setEditingPhone(null);
      toast.success("Phone line updated successfully");
    },
    onError: () => toast.error("Failed to update phone line"),
  });

  function openEdit(phone: PhoneLine) {
    setEditingPhone(phone);
    setFormData({
      carrier: phone.carrier || "",
      deviceLabel: phone.deviceLabel || "",
      forwardingTo: phone.forwardingTo || "",
      forwardingActive: phone.forwardingActive,
      notes: phone.notes || "",
    });
    setSheetOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingPhone) {
      updateMutation.mutate({ ...formData, id: editingPhone.id });
    }
  }

  const statusConfig = (status: string) => {
    switch (status) {
      case "available":
        return { color: "bg-green-500", label: "Available", badgeClass: "bg-green-100 text-green-700" };
      case "assigned":
        return { color: "bg-blue-500", label: "Assigned", badgeClass: "bg-blue-100 text-blue-700" };
      case "in_use":
        return { color: "bg-yellow-500", label: "In Use", badgeClass: "bg-yellow-100 text-yellow-700" };
      default:
        return { color: "bg-gray-500", label: status, badgeClass: "bg-gray-100 text-gray-700" };
    }
  };

  const availableCount = phones.filter((p) => p.status === "available").length;
  const assignedCount = phones.filter((p) => p.status === "assigned").length;
  const inUseCount = phones.filter((p) => p.status === "in_use").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Phone Lines</h1>
          <p className="text-muted-foreground">
            Manage phone lines for MID applications
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm">
            <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Available: {availableCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Assigned: {assignedCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm">
            <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
            <span className="text-muted-foreground">In Use: {inUseCount}</span>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 14 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : phones.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Phone className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No phone lines configured yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {phones.map((phone) => {
            const config = statusConfig(phone.status);
            return (
              <Card
                key={phone.id}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md hover:border-primary/30",
                  phone.status === "available" && "border-green-200",
                  phone.status === "assigned" && "border-blue-200",
                  phone.status === "in_use" && "border-yellow-200"
                )}
                onClick={() => openEdit(phone)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("p-2 rounded-lg", phone.status === "available" ? "bg-green-50" : phone.status === "assigned" ? "bg-blue-50" : "bg-yellow-50")}>
                        <Smartphone className={cn("h-4 w-4", phone.status === "available" ? "text-green-600" : phone.status === "assigned" ? "text-blue-600" : "text-yellow-600")} />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-mono">{phone.phoneNumber}</CardTitle>
                        {phone.deviceLabel && (
                          <p className="text-xs text-muted-foreground">{phone.deviceLabel}</p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className={cn("text-xs", config.badgeClass)}>
                      {config.label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  {phone.carrier && (
                    <div className="flex items-center gap-2 text-sm">
                      <Signal className="h-3 w-3 text-muted-foreground" />
                      <span className="text-muted-foreground">{phone.carrier}</span>
                    </div>
                  )}
                  {phone.applicationName && (
                    <div className="text-xs">
                      <span className="text-muted-foreground">Assigned: </span>
                      <span className="font-medium">{phone.applicationName}</span>
                    </div>
                  )}
                  {phone.forwardingActive && phone.forwardingTo && (
                    <div className="text-xs text-muted-foreground">
                      Forwarding to {phone.forwardingTo}
                    </div>
                  )}
                  <div className="pt-2">
                    <Button variant="ghost" size="sm" className="w-full h-7 text-xs" onClick={(e) => { e.stopPropagation(); openEdit(phone); }}>
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) setEditingPhone(null); }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Edit Phone Line</SheetTitle>
            <SheetDescription>
              {editingPhone?.phoneNumber} - Update phone line configuration
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="carrier">Carrier</Label>
              <Input id="carrier" value={formData.carrier} onChange={(e) => setFormData({ ...formData, carrier: e.target.value })} placeholder="e.g. Rogers, Bell, Telus" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="deviceLabel">Device Label</Label>
              <Input id="deviceLabel" value={formData.deviceLabel} onChange={(e) => setFormData({ ...formData, deviceLabel: e.target.value })} placeholder="e.g. iPhone 14 Pro #3" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="forwardingTo">Forward To</Label>
              <Input id="forwardingTo" value={formData.forwardingTo} onChange={(e) => setFormData({ ...formData, forwardingTo: e.target.value })} placeholder="Phone number to forward calls" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="forwardingActive">Forwarding Active</Label>
              <Switch id="forwardingActive" checked={formData.forwardingActive} onCheckedChange={(checked) => setFormData({ ...formData, forwardingActive: checked })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>
            <SheetFooter className="mt-6">
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? "Saving..." : "Update Phone Line"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
