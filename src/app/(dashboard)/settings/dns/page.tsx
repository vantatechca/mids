"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, AlertCircle, Globe, Server } from "lucide-react";
import { toast } from "sonner";

type DnsRecord = {
  type: string;
  name: string;
  value: string;
  ttl: number;
  priority?: number;
};

type Domain = {
  id: number;
  domainName: string;
  dnsRecords: DnsRecord[];
  dnsProvider: string | null;
  nameservers: string[];
};

const DNS_RECORD_TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS"];

const emptyRecord: DnsRecord = {
  type: "A",
  name: "@",
  value: "",
  ttl: 3600,
};

export default function DnsPage() {
  const queryClient = useQueryClient();
  const [selectedDomainId, setSelectedDomainId] = useState<string>("");
  const [addRecordOpen, setAddRecordOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<DnsRecord>({ ...emptyRecord });

  const { data: domains = [], isLoading: loadingDomains } = useQuery<Domain[]>({
    queryKey: ["domains"],
    queryFn: () => fetch("/api/domains").then((r) => r.json()),
  });

  const selectedDomain = domains.find((d) => d.id.toString() === selectedDomainId);

  const addRecordMutation = useMutation({
    mutationFn: (data: { domainId: string; record: DnsRecord }) =>
      fetch(`/api/domains/${data.domainId}/dns`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data.record),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      setAddRecordOpen(false);
      setNewRecord({ ...emptyRecord });
      toast.success("DNS record added");
    },
    onError: () => toast.error("Failed to add DNS record"),
  });

  const deleteRecordMutation = useMutation({
    mutationFn: ({ domainId, recordIndex }: { domainId: string; recordIndex: number }) =>
      fetch(`/api/domains/${domainId}/dns/${recordIndex}`, {
        method: "DELETE",
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["domains"] });
      toast.success("DNS record deleted");
    },
    onError: () => toast.error("Failed to delete DNS record"),
  });

  function handleAddRecord(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDomainId || !newRecord.value) {
      toast.error("Domain and value are required");
      return;
    }
    addRecordMutation.mutate({ domainId: selectedDomainId, record: newRecord });
  }

  const records = selectedDomain?.dnsRecords || [];

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold">DNS Management</h1>
            <p className="text-muted-foreground">Manage DNS records for your domains</p>
          </div>
          <Badge variant="outline" className="text-xs">
            <AlertCircle className="h-3 w-3 mr-1" />
            UI Only
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Select Domain
          </CardTitle>
          <CardDescription>Choose a domain to manage its DNS records</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingDomains ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select value={selectedDomainId} onValueChange={setSelectedDomainId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a domain..." />
              </SelectTrigger>
              <SelectContent>
                {domains.map((domain) => (
                  <SelectItem key={domain.id} value={domain.id.toString()}>
                    {domain.domainName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {selectedDomain && (
            <div className="mt-4 space-y-2">
              {selectedDomain.dnsProvider && (
                <div className="flex items-center gap-2 text-sm">
                  <Server className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">DNS Provider:</span>
                  <span className="font-medium">{selectedDomain.dnsProvider}</span>
                </div>
              )}
              {selectedDomain.nameservers && selectedDomain.nameservers.length > 0 && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Nameservers: </span>
                  <span className="font-mono text-xs">{selectedDomain.nameservers.join(", ")}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDomain && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">DNS Records</CardTitle>
                <CardDescription>{selectedDomain.domainName} - {records.length} records</CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddRecordOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />Add Record
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>TTL</TableHead>
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No DNS records configured for this domain
                    </TableCell>
                  </TableRow>
                ) : (
                  records.map((record, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">{record.type}</Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{record.name}</TableCell>
                      <TableCell className="font-mono text-sm max-w-[250px] truncate" title={record.value}>
                        {record.value}
                        {record.priority !== undefined && (
                          <span className="text-muted-foreground ml-2">(Priority: {record.priority})</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{record.ttl}s</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => deleteRecordMutation.mutate({
                            domainId: selectedDomainId,
                            recordIndex: index,
                          })}
                          disabled={deleteRecordMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Add Record Dialog */}
      <Dialog open={addRecordOpen} onOpenChange={setAddRecordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add DNS Record</DialogTitle>
            <DialogDescription>Add a new DNS record for {selectedDomain?.domainName}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddRecord} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recordType">Type</Label>
                <Select value={newRecord.type} onValueChange={(val) => setNewRecord({ ...newRecord, type: val })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {DNS_RECORD_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="recordName">Name</Label>
                <Input id="recordName" value={newRecord.name} onChange={(e) => setNewRecord({ ...newRecord, name: e.target.value })} placeholder="@ or subdomain" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recordValue">Value *</Label>
              <Input id="recordValue" value={newRecord.value} onChange={(e) => setNewRecord({ ...newRecord, value: e.target.value })} placeholder="e.g. 192.168.1.1 or mail.example.com" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="recordTtl">TTL (seconds)</Label>
                <Input id="recordTtl" type="number" min="60" value={newRecord.ttl} onChange={(e) => setNewRecord({ ...newRecord, ttl: parseInt(e.target.value) || 3600 })} />
              </div>
              {newRecord.type === "MX" && (
                <div className="space-y-2">
                  <Label htmlFor="recordPriority">Priority</Label>
                  <Input id="recordPriority" type="number" min="0" value={newRecord.priority || ""} onChange={(e) => setNewRecord({ ...newRecord, priority: parseInt(e.target.value) || undefined })} placeholder="10" />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setAddRecordOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={addRecordMutation.isPending}>
                {addRecordMutation.isPending ? "Adding..." : "Add Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
