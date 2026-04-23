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
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Globe, ShieldCheck, ShieldOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

type Domain = {
  id: number;
  domainName: string;
  registrar: string | null;
  registrarAccount: string | null;
  expiryDate: string | null;
  sslStatus: string | null;
  websiteLive: boolean;
  websitePlatform: string | null;
  assignedToCompanyId: number | null;
  assignedToApplicationId: number | null;
  status: string;
  notes: string | null;
  createdAt: string;
  companyName?: string;
};

const SSL_STATUSES = ["none", "pending", "active", "expired", "invalid"];

const emptyForm = {
  domainName: "",
  registrar: "",
  registrarAccount: "",
  expiryDate: "",
  sslStatus: "none",
  websitePlatform: "",
  notes: "",
};

export default function DomainsPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingDomain, setEditingDomain] = useState<Domain | null>(null);
  const [deletingDomain, setDeletingDomain] = useState<Domain | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  const { data: domains = [], isLoading } = useQuery<Domain[]>({
    queryKey: ["domains"],
    queryFn: () => fetch("/api/domains").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof emptyForm) =>
      fetch("/api/domains", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      setSheetOpen(false);
      resetForm();
      toast.success("Domain created successfully");
    },
    onError: () => toast.error("Failed to create domain"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: typeof emptyForm & { id: number }) =>
      fetch(`/api/domains/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      setSheetOpen(false);
      setEditingDomain(null);
      resetForm();
      toast.success("Domain updated successfully");
    },
    onError: () => toast.error("Failed to update domain"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/domains/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      setDeleteDialogOpen(false);
      setDeletingDomain(null);
      toast.success("Domain deleted successfully");
    },
    onError: () => toast.error("Failed to delete domain"),
  });

  function resetForm() {
    setFormData(emptyForm);
    setEditingDomain(null);
  }

  function openCreate() {
    resetForm();
    setSheetOpen(true);
  }

  function openEdit(domain: Domain) {
    setEditingDomain(domain);
    setFormData({
      domainName: domain.domainName,
      registrar: domain.registrar || "",
      registrarAccount: domain.registrarAccount || "",
      expiryDate: domain.expiryDate || "",
      sslStatus: domain.sslStatus || "none",
      websitePlatform: domain.websitePlatform || "",
      notes: domain.notes || "",
    });
    setSheetOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (editingDomain) {
      updateMutation.mutate({ ...formData, id: editingDomain.id });
    } else {
      createMutation.mutate(formData);
    }
  }

  const filteredDomains = domains.filter(
    (d) =>
      d.domainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.registrar?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sslBadge = (status: string | null) => {
    switch (status) {
      case "active":
        return <Badge variant="secondary" className="bg-green-100 text-green-700"><ShieldCheck className="h-3 w-3 mr-1" />Active</Badge>;
      case "expired":
        return <Badge variant="secondary" className="bg-red-100 text-red-700"><ShieldOff className="h-3 w-3 mr-1" />Expired</Badge>;
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">Pending</Badge>;
      default:
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">None</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Domains</h1>
          <p className="text-muted-foreground">Manage domains for your applications</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Domain
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search domains..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <p className="text-sm text-muted-foreground">{filteredDomains.length} domains</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (<Skeleton key={i} className="h-12 w-full" />))}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain Name</TableHead>
                  <TableHead>Registrar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SSL Status</TableHead>
                  <TableHead>Website Live</TableHead>
                  <TableHead>Assigned Company</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDomains.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      {searchQuery ? "No domains match your search" : "No domains yet. Add your first domain to get started."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDomains.map((domain) => (
                    <TableRow key={domain.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{domain.domainName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{domain.registrar || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={domain.status === "available" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}>
                          {domain.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{sslBadge(domain.sslStatus)}</TableCell>
                      <TableCell>
                        {domain.websiteLive ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{domain.companyName || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(domain)}>
                              <Pencil className="h-4 w-4 mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { setDeletingDomain(domain); setDeleteDialogOpen(true); }}>
                              <Trash2 className="h-4 w-4 mr-2" />Delete
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
            <SheetTitle>{editingDomain ? "Edit Domain" : "Add Domain"}</SheetTitle>
            <SheetDescription>{editingDomain ? "Update domain details" : "Register a new domain"}</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="domainName">Domain Name *</Label>
              <Input id="domainName" value={formData.domainName} onChange={(e) => setFormData({ ...formData, domainName: e.target.value })} placeholder="example.com" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrar">Registrar</Label>
              <Input id="registrar" value={formData.registrar} onChange={(e) => setFormData({ ...formData, registrar: e.target.value })} placeholder="e.g. GoDaddy, Namecheap" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="registrarAccount">Registrar Account</Label>
              <Input id="registrarAccount" value={formData.registrarAccount} onChange={(e) => setFormData({ ...formData, registrarAccount: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input id="expiryDate" type="date" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sslStatus">SSL Status</Label>
              <Select value={formData.sslStatus} onValueChange={(val) => setFormData({ ...formData, sslStatus: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SSL_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="websitePlatform">Website Platform</Label>
              <Input id="websitePlatform" value={formData.websitePlatform} onChange={(e) => setFormData({ ...formData, websitePlatform: e.target.value })} placeholder="e.g. Shopify, WordPress" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>
            <SheetFooter className="mt-6">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingDomain ? "Update Domain" : "Create Domain"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Domain</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingDomain?.domainName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingDomain && deleteMutation.mutate(deletingDomain.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
