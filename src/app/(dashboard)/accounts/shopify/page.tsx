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
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Plus, MoreHorizontal, Pencil, Search } from "lucide-react";
import { toast } from "sonner";

type Account = {
  id: number;
  platform: string;
  accountName: string | null;
  accountEmail: string | null;
  accountId: string | null;
  companyId: number | null;
  companyName?: string;
  domainId: number | null;
  domainName?: string;
  status: string;
  monthlyVolume: string | null;
  notes: string | null;
  createdAt: string;
};

const STATUS_OPTIONS = ["active", "inactive", "suspended", "pending", "closed"];

const emptyForm = {
  accountName: "",
  accountEmail: "",
  accountId: "",
  companyId: "",
  domainId: "",
  status: "active",
  monthlyVolume: "",
  notes: "",
};

export default function ShopifyAccountsPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [formData, setFormData] = useState(emptyForm);

  const { data: accounts = [], isLoading } = useQuery<Account[]>({
    queryKey: ["accounts", "shopify"],
    queryFn: () => fetch("/api/accounts?platform=shopify").then((r) => r.json()),
  });

  const { data: companies = [] } = useQuery<Array<{ id: number; legalName: string }>>({
    queryKey: ["companies-list"],
    queryFn: () => fetch("/api/companies").then((r) => r.json()),
  });

  const { data: domains = [] } = useQuery<Array<{ id: number; domainName: string }>>({
    queryKey: ["domains-list"],
    queryFn: () => fetch("/api/domains").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, platform: "shopify" }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", "shopify"] });
      setSheetOpen(false);
      resetForm();
      toast.success("Account created successfully");
    },
    onError: () => toast.error("Failed to create account"),
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown> & { id: number }) =>
      fetch(`/api/accounts/${data.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts", "shopify"] });
      setSheetOpen(false);
      setEditingAccount(null);
      resetForm();
      toast.success("Account updated successfully");
    },
    onError: () => toast.error("Failed to update account"),
  });

  function resetForm() {
    setFormData(emptyForm);
    setEditingAccount(null);
  }

  function openCreate() {
    resetForm();
    setSheetOpen(true);
  }

  function openEdit(account: Account) {
    setEditingAccount(account);
    setFormData({
      accountName: account.accountName || "",
      accountEmail: account.accountEmail || "",
      accountId: account.accountId || "",
      companyId: account.companyId?.toString() || "",
      domainId: account.domainId?.toString() || "",
      status: account.status,
      monthlyVolume: account.monthlyVolume || "",
      notes: account.notes || "",
    });
    setSheetOpen(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      ...formData,
      companyId: formData.companyId ? parseInt(formData.companyId) : null,
      domainId: formData.domainId ? parseInt(formData.domainId) : null,
    };
    if (editingAccount) {
      updateMutation.mutate({ ...payload, id: editingAccount.id });
    } else {
      createMutation.mutate(payload);
    }
  }

  const filteredAccounts = accounts.filter((a) => {
    const matchesSearch =
      a.accountName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.accountEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.accountId?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "inactive": return "bg-gray-100 text-gray-700";
      case "suspended": return "bg-red-100 text-red-700";
      case "pending": return "bg-yellow-100 text-yellow-700";
      case "closed": return "bg-gray-200 text-gray-800";
      default: return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Shopify Accounts</h1>
          <p className="text-muted-foreground">Manage Shopify store accounts</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4 mr-2" />Add Account
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search accounts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            {STATUS_OPTIONS.map((s) => (
              <SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-muted-foreground">{filteredAccounts.length} accounts</p>
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
                  <TableHead>Account Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Account ID</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Monthly Volume</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAccounts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {searchQuery || statusFilter !== "all" ? "No accounts match your filters" : "No Shopify accounts yet."}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAccounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-medium">{account.accountName || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{account.accountEmail || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">{account.accountId || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{account.companyName || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{account.domainName || "-"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={statusColor(account.status)}>{account.status}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{account.monthlyVolume || "-"}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(account)}>
                              <Pencil className="h-4 w-4 mr-2" />Edit
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
            <SheetTitle>{editingAccount ? "Edit Shopify Account" : "Add Shopify Account"}</SheetTitle>
            <SheetDescription>{editingAccount ? "Update account details" : "Add a new Shopify store account"}</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="accountName">Account Name</Label>
              <Input id="accountName" value={formData.accountName} onChange={(e) => setFormData({ ...formData, accountName: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountEmail">Email</Label>
              <Input id="accountEmail" type="email" value={formData.accountEmail} onChange={(e) => setFormData({ ...formData, accountEmail: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountId">Account ID</Label>
              <Input id="accountId" value={formData.accountId} onChange={(e) => setFormData({ ...formData, accountId: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyId">Company</Label>
              <Select value={formData.companyId} onValueChange={(val) => setFormData({ ...formData, companyId: val })}>
                <SelectTrigger><SelectValue placeholder="Select company" /></SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.legalName}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="domainId">Domain</Label>
              <Select value={formData.domainId} onValueChange={(val) => setFormData({ ...formData, domainId: val })}>
                <SelectTrigger><SelectValue placeholder="Select domain" /></SelectTrigger>
                <SelectContent>
                  {domains.map((d) => (<SelectItem key={d.id} value={d.id.toString()}>{d.domainName}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(val) => setFormData({ ...formData, status: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (<SelectItem key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="monthlyVolume">Monthly Volume</Label>
              <Input id="monthlyVolume" value={formData.monthlyVolume} onChange={(e) => setFormData({ ...formData, monthlyVolume: e.target.value })} placeholder="e.g. $10,000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>
            <SheetFooter className="mt-6">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : editingAccount ? "Update Account" : "Create Account"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
