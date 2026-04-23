"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, MoreHorizontal, Pencil, Trash2, Search, Shield, AlertTriangle } from "lucide-react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

type IsolationRule = {
  id: number;
  ruleName: string;
  assetType: string;
  scope: string;
  allowSharing: boolean;
  maxUses: number | null;
  isActive: boolean;
  violationCount?: number;
  createdAt: string;
};

const ASSET_TYPES = ["phone_line", "domain", "company", "identity", "email"];
const SCOPES = ["per_processor", "per_application", "global"];

const emptyForm = {
  ruleName: "",
  assetType: "",
  scope: "",
  allowSharing: false,
  maxUses: "",
  isActive: true,
};

export default function IsolationRulesPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<IsolationRule | null>(null);
  const [deletingRule, setDeletingRule] = useState<IsolationRule | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  const { data: rules = [], isLoading } = useQuery<IsolationRule[]>({
    queryKey: ["isolation-rules"],
    queryFn: () => fetch("/api/isolation-rules").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/isolation-rules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isolation-rules"] });
      setSheetOpen(false);
      resetForm();
      toast.success("Rule created successfully");
    },
    onError: () => toast.error("Failed to create rule"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown> & { id: number }) =>
      fetch(`/api/isolation-rules/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isolation-rules"] });
      setSheetOpen(false);
      setEditingRule(null);
      resetForm();
      toast.success("Rule updated successfully");
    },
    onError: () => toast.error("Failed to update rule"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      fetch(`/api/isolation-rules/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isolation-rules"] });
      setDeleteDialogOpen(false);
      setDeletingRule(null);
      toast.success("Rule deleted successfully");
    },
    onError: () => toast.error("Failed to delete rule"),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      fetch(`/api/isolation-rules/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isolation-rules"] });
    },
    onError: () => toast.error("Failed to toggle rule"),
  });

  function resetForm() {
    setFormData(emptyForm);
    setEditingRule(null);
  }

  function openCreate() {
    resetForm();
    setSheetOpen(true);
  }

  function openEdit(rule: IsolationRule) {
    setEditingRule(rule);
    setFormData({
      ruleName: rule.ruleName,
      assetType: rule.assetType,
      scope: rule.scope,
      allowSharing: rule.allowSharing,
      maxUses: rule.maxUses?.toString() || "",
      isActive: rule.isActive,
    });
    setSheetOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...formData,
      maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
    };
    if (editingRule) {
      updateMutation.mutate({ ...payload, id: editingRule.id });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filteredRules = rules.filter((r) =>
    r.ruleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.assetType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCount = rules.filter((r) => r.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Isolation Rules</h1>
          <p className="text-muted-foreground">
            Manage asset sharing and isolation policies
            {activeCount > 0 && <span className="ml-2 font-medium text-foreground">{activeCount} active</span>}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Add Rule
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search rules..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <p className="text-sm text-muted-foreground">{filteredRules.length} rules</p>
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
                  <TableHead>Rule Name</TableHead>
                  <TableHead>Asset Type</TableHead>
                  <TableHead>Scope</TableHead>
                  <TableHead>Allow Sharing</TableHead>
                  <TableHead>Max Uses</TableHead>
                  <TableHead>Violations</TableHead>
                  <TableHead>Active</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      <Shield className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                      {searchQuery ? "No rules match your search" : "No isolation rules defined yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRules.map((rule) => (
                    <TableRow key={rule.id} className={!rule.isActive ? "opacity-50" : ""}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-muted-foreground" />
                          {rule.ruleName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs capitalize">{rule.assetType.replace(/_/g, " ")}</Badge>
                      </TableCell>
                      <TableCell className="capitalize text-muted-foreground">{rule.scope.replace(/_/g, " ")}</TableCell>
                      <TableCell>
                        {rule.allowSharing ? (
                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Yes</Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">No</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{rule.maxUses ?? "Unlimited"}</TableCell>
                      <TableCell>
                        {(rule.violationCount ?? 0) > 0 ? (
                          <div className="flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                            <span className="text-amber-600 font-medium text-sm">{rule.violationCount}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">0</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={rule.isActive}
                          onCheckedChange={(checked) => toggleMutation.mutate({ id: rule.id, isActive: checked })}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(rule)}>
                              <Pencil className="h-4 w-4 mr-2" />Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => { setDeletingRule(rule); setDeleteDialogOpen(true); }}>
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
            <SheetTitle>{editingRule ? "Edit Isolation Rule" : "Add Isolation Rule"}</SheetTitle>
            <SheetDescription>{editingRule ? "Update rule configuration" : "Define a new isolation policy"}</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="ruleName">Rule Name *</Label>
              <Input id="ruleName" value={formData.ruleName} onChange={(e) => setFormData({ ...formData, ruleName: e.target.value })} required placeholder="e.g. One phone per processor" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type *</Label>
              <Select value={formData.assetType} onValueChange={(val) => setFormData({ ...formData, assetType: val })}>
                <SelectTrigger><SelectValue placeholder="Select asset type" /></SelectTrigger>
                <SelectContent>
                  {ASSET_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scope">Scope *</Label>
              <Select value={formData.scope} onValueChange={(val) => setFormData({ ...formData, scope: val })}>
                <SelectTrigger><SelectValue placeholder="Select scope" /></SelectTrigger>
                <SelectContent>
                  {SCOPES.map((s) => (
                    <SelectItem key={s} value={s}>{s.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="allowSharing">Allow Sharing</Label>
              <Switch id="allowSharing" checked={formData.allowSharing} onCheckedChange={(checked) => setFormData({ ...formData, allowSharing: checked })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUses">Max Uses (leave blank for unlimited)</Label>
              <Input id="maxUses" type="number" min="1" value={formData.maxUses} onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })} placeholder="Unlimited" />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="isActive">Active</Label>
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
            </div>
            <SheetFooter className="mt-6">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingRule ? "Update Rule" : "Create Rule"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rule</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deletingRule?.ruleName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={() => deletingRule && deleteMutation.mutate(deletingRule.id)} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
