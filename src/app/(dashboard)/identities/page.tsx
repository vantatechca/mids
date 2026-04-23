"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MoreHorizontal, Pencil, Trash2, Search, User } from "lucide-react";
import { toast } from "sonner";

type Identity = {
  id: number;
  personName: string;
  dateOfBirth: string | null;
  idType: string | null;
  idNumber: string | null;
  idProvinceState: string | null;
  idExpiryDate: string | null;
  linkedCompanies: number[];
  notes: string | null;
  createdAt: string;
};

const ID_TYPES = [
  "drivers_license",
  "passport",
  "provincial_id",
  "permanent_resident_card",
  "citizenship_card",
  "other",
];

const emptyForm = {
  personName: "",
  dateOfBirth: "",
  idType: "",
  idNumber: "",
  idProvinceState: "",
  idExpiryDate: "",
  notes: "",
};

export default function IdentitiesPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingIdentity, setEditingIdentity] = useState<Identity | null>(null);
  const [deletingIdentity, setDeletingIdentity] = useState<Identity | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  const { data: identities = [], isLoading } = useQuery<Identity[]>({
    queryKey: ["identities"],
    queryFn: () => fetch("/api/identities").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      fetch("/api/identities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identities"] });
      setSheetOpen(false);
      resetForm();
      toast.success("Identity created successfully");
    },
    onError: () => toast.error("Failed to create identity"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof emptyForm & { id: number }) =>
      fetch(`/api/identities/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identities"] });
      setSheetOpen(false);
      setEditingIdentity(null);
      resetForm();
      toast.success("Identity updated successfully");
    },
    onError: () => toast.error("Failed to update identity"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/identities/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["identities"] });
      setDeleteDialogOpen(false);
      setDeletingIdentity(null);
      toast.success("Identity deleted successfully");
    },
    onError: () => toast.error("Failed to delete identity"),
  });

  function resetForm() {
    setFormData(emptyForm);
    setEditingIdentity(null);
  }

  function openCreate() {
    resetForm();
    setSheetOpen(true);
  }

  function openEdit(identity: Identity) {
    setEditingIdentity(identity);
    setFormData({
      personName: identity.personName,
      dateOfBirth: identity.dateOfBirth || "",
      idType: identity.idType || "",
      idNumber: identity.idNumber || "",
      idProvinceState: identity.idProvinceState || "",
      idExpiryDate: identity.idExpiryDate || "",
      notes: identity.notes || "",
    });
    setSheetOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingIdentity) {
      updateMutation.mutate({ ...formData, id: editingIdentity.id });
    } else {
      createMutation.mutate(formData);
    }
  }

  const filteredIdentities = identities.filter(
    (i) =>
      i.personName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.idNumber?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Identities</h1>
          <p className="text-muted-foreground">
            Manage personal identities linked to companies
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Identity
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search identities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <p className="text-sm text-muted-foreground">
          {filteredIdentities.length} identities
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Person Name</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>ID Type</TableHead>
                  <TableHead>ID Number</TableHead>
                  <TableHead>Expiry Date</TableHead>
                  <TableHead>Linked Companies</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIdentities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No identities match your search" : "No identities yet. Add your first identity to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIdentities.map((identity) => (
                    <TableRow key={identity.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                            <User className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <span className="font-medium">{identity.personName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{identity.dateOfBirth || "-"}</TableCell>
                      <TableCell>
                        {identity.idType ? (
                          <Badge variant="outline" className="text-xs capitalize">
                            {identity.idType.replace(/_/g, " ")}
                          </Badge>
                        ) : "-"}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {identity.idNumber || "-"}
                      </TableCell>
                      <TableCell>
                        {identity.idExpiryDate ? (
                          <span className={new Date(identity.idExpiryDate) < new Date() ? "text-red-600 font-medium" : ""}>
                            {identity.idExpiryDate}
                          </span>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{identity.linkedCompanies?.length || 0}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(identity)}>
                              <Pencil className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => { setDeletingIdentity(identity); setDeleteDialogOpen(true); }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={(open) => { setSheetOpen(open); if (!open) resetForm(); }}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{editingIdentity ? "Edit Identity" : "Add Identity"}</SheetTitle>
            <SheetDescription>
              {editingIdentity ? "Update identity details" : "Add a new personal identity"}
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="personName">Person Name *</Label>
              <Input id="personName" value={formData.personName} onChange={(e) => setFormData({ ...formData, personName: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idType">ID Type</Label>
              <Select value={formData.idType} onValueChange={(val) => setFormData({ ...formData, idType: val })}>
                <SelectTrigger><SelectValue placeholder="Select ID type" /></SelectTrigger>
                <SelectContent>
                  {ID_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="idNumber">ID Number</Label>
              <Input id="idNumber" value={formData.idNumber} onChange={(e) => setFormData({ ...formData, idNumber: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idProvinceState">ID Province/State</Label>
              <Input id="idProvinceState" value={formData.idProvinceState} onChange={(e) => setFormData({ ...formData, idProvinceState: e.target.value })} placeholder="e.g. Ontario" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="idExpiryDate">ID Expiry Date</Label>
              <Input id="idExpiryDate" type="date" value={formData.idExpiryDate} onChange={(e) => setFormData({ ...formData, idExpiryDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>
            <SheetFooter className="mt-6">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingIdentity ? "Update Identity" : "Create Identity"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Identity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingIdentity?.personName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingIdentity && deleteMutation.mutate(deletingIdentity.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
