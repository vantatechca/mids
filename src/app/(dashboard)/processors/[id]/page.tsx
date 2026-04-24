"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { ArrowLeft, Plus, Trash2, Save, Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";

type ProcessorField = {
  fieldName: string;
  fieldLabel: string;
  fieldType: "text" | "select" | "date" | "file" | "textarea" | "number" | "checkbox";
  required: boolean;
  options?: string[];
  mapsTo?: string;
  section?: string;
  description?: string;
};

type Processor = {
  id: number;
  name: string;
  websiteUrl: string | null;
  applicationUrl: string | null;
  country: string;
  supportsCanada: boolean;
  supportsUs: boolean;
  typicalApprovalTime: string | null;
  integrationType: string | null;
  shopifyCompatible: boolean;
  difficultyRating: number | null;
  successRateEstimate: number | null;
  requiredFields: ProcessorField[];
  requiredDocuments: string[];
  kycRequirements: string | null;
  notes: string | null;
  applicationCount?: number;
  approvalRate?: number;
};

const FIELD_TYPES: ProcessorField["fieldType"][] = [
  "text", "select", "date", "file", "textarea", "number", "checkbox",
];

const MAPS_TO_OPTIONS = [
  "company.legalName", "company.tradeName", "company.taxId", "company.gstHstNumber",
  "company.registrationNumber", "company.jurisdiction", "company.registeredAddress.street",
  "company.registeredAddress.city", "company.registeredAddress.province",
  "company.registeredAddress.postalCode", "company.registeredAddress.country",
  "identity.personName", "identity.dateOfBirth", "identity.idType", "identity.idNumber",
  "phone.phoneNumber", "domain.domainName", "application.emailAddress",
];

const emptyField: ProcessorField = {
  fieldName: "",
  fieldLabel: "",
  fieldType: "text",
  required: false,
  mapsTo: "",
  section: "",
  description: "",
};

export default function ProcessorDetailPage() {
  const params = useParams();
  const processorId = params.id as string;
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<Processor>>({});
  const [fields, setFields] = useState<ProcessorField[]>([]);
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [newField, setNewField] = useState<ProcessorField>({ ...emptyField });

  const { data: processor, isLoading } = useQuery<Processor>({
    queryKey: ["processor", processorId],
    queryFn: () => fetch(`/api/processors/${processorId}`).then((r) => r.json()),
    enabled: !!processorId,
  });

  const updateMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(`/api/processors/${processorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processor", processorId] });
      setIsEditing(false);
      toast.success("Processor updated successfully");
    },
    onError: () => toast.error("Failed to update processor"),
  });

  function startEditing() {
    if (!processor) return;
    setEditData({
      name: processor.name,
      websiteUrl: processor.websiteUrl,
      applicationUrl: processor.applicationUrl,
      country: processor.country,
      supportsCanada: processor.supportsCanada,
      supportsUs: processor.supportsUs,
      typicalApprovalTime: processor.typicalApprovalTime,
      integrationType: processor.integrationType,
      shopifyCompatible: processor.shopifyCompatible,
      difficultyRating: processor.difficultyRating,
      successRateEstimate: processor.successRateEstimate,
      kycRequirements: processor.kycRequirements,
      notes: processor.notes,
    });
    setFields(processor.requiredFields || []);
    setIsEditing(true);
  }

  function saveChanges() {
    updateMutation.mutate({
      ...editData,
      requiredFields: fields,
    });
  }

  function addField() {
    if (!newField.fieldName || !newField.fieldLabel) {
      toast.error("Field name and label are required");
      return;
    }
    setFields([...fields, { ...newField }]);
    setNewField({ ...emptyField });
    setAddFieldOpen(false);
  }

  function removeField(index: number) {
    setFields(fields.filter((_, i) => i !== index));
  }

  function renderStars(rating: number | null) {
    if (!rating) return <span className="text-muted-foreground">N/A</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star key={i} className={cn("h-4 w-4", i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")} />
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!processor) {
    return (
      <div className="space-y-6">
        <Link href="/processors" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back to Processors
        </Link>
        <p className="text-muted-foreground">Processor not found.</p>
      </div>
    );
  }

  const displayFields = isEditing ? fields : processor.requiredFields || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/processors" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">{processor.name}</h1>
            <p className="text-muted-foreground">{processor.country} - {processor.integrationType || "Manual"} integration</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button onClick={saveChanges} disabled={updateMutation.isPending}>
                <Save className="h-4 w-4 mr-2" />{updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button onClick={startEditing}>Edit Processor</Button>
          )}
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Processor Details</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={editData.name || ""} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input value={editData.country || ""} onChange={(e) => setEditData({ ...editData, country: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Website URL</Label>
                  <Input value={editData.websiteUrl || ""} onChange={(e) => setEditData({ ...editData, websiteUrl: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Application URL</Label>
                  <Input value={editData.applicationUrl || ""} onChange={(e) => setEditData({ ...editData, applicationUrl: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Approval Time</Label>
                  <Input value={editData.typicalApprovalTime || ""} onChange={(e) => setEditData({ ...editData, typicalApprovalTime: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Integration Type</Label>
                  <Input value={editData.integrationType || ""} onChange={(e) => setEditData({ ...editData, integrationType: e.target.value })} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>KYC Requirements</Label>
                  <Textarea value={editData.kycRequirements || ""} onChange={(e) => setEditData({ ...editData, kycRequirements: e.target.value })} rows={2} />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Notes</Label>
                  <Textarea value={editData.notes || ""} onChange={(e) => setEditData({ ...editData, notes: e.target.value })} rows={2} />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-y-3 gap-x-8 text-sm">
                <div><span className="text-muted-foreground">Website:</span> {processor.websiteUrl ? <a href={processor.websiteUrl} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">{processor.websiteUrl}</a> : "N/A"}</div>
                <div><span className="text-muted-foreground">Application URL:</span> {processor.applicationUrl || "N/A"}</div>
                <div><span className="text-muted-foreground">Supports Canada:</span> {processor.supportsCanada ? "Yes" : "No"}</div>
                <div><span className="text-muted-foreground">Supports US:</span> {processor.supportsUs ? "Yes" : "No"}</div>
                <div><span className="text-muted-foreground">Approval Time:</span> {processor.typicalApprovalTime || "N/A"}</div>
                <div><span className="text-muted-foreground">Integration:</span> <span className="capitalize">{processor.integrationType || "N/A"}</span></div>
                <div><span className="text-muted-foreground">Shopify:</span> {processor.shopifyCompatible ? <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs">Compatible</Badge> : "No"}</div>
                <div><span className="text-muted-foreground">KYC:</span> {processor.kycRequirements || "N/A"}</div>
                {processor.notes && <div className="col-span-2"><span className="text-muted-foreground">Notes:</span> {processor.notes}</div>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Difficulty Rating</p>
              <div className="mt-1">{renderStars(processor.difficultyRating)}</div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Success Rate</p>
              <p className="text-2xl font-bold">{processor.successRateEstimate != null ? `${processor.successRateEstimate}%` : "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="text-2xl font-bold">{processor.applicationCount ?? 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Actual Approval Rate</p>
              <p className="text-2xl font-bold">{processor.approvalRate != null ? `${processor.approvalRate}%` : "N/A"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Required Fields */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Required Fields</CardTitle>
              <CardDescription>Fields needed when submitting an application to this processor</CardDescription>
            </div>
            {isEditing && (
              <Button size="sm" onClick={() => setAddFieldOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />Add Field
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Field Name</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Required</TableHead>
                <TableHead>Maps To</TableHead>
                <TableHead>Section</TableHead>
                {isEditing && <TableHead className="w-[50px]" />}
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayFields.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isEditing ? 7 : 6} className="text-center py-8 text-muted-foreground">
                    No required fields defined yet
                  </TableCell>
                </TableRow>
              ) : (
                displayFields.map((field, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-sm">{field.fieldName}</TableCell>
                    <TableCell>{field.fieldLabel}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{field.fieldType}</Badge>
                    </TableCell>
                    <TableCell>
                      {field.required ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <span className="text-muted-foreground text-xs">Optional</span>}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">{field.mapsTo || "-"}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{field.section || "-"}</TableCell>
                    {isEditing && (
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => removeField(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Field Dialog */}
      <Dialog open={addFieldOpen} onOpenChange={setAddFieldOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Required Field</DialogTitle>
            <DialogDescription>Define a new field required by this processor</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Name *</Label>
                <Input value={newField.fieldName} onChange={(e) => setNewField({ ...newField, fieldName: e.target.value })} placeholder="e.g. business_name" />
              </div>
              <div className="space-y-2">
                <Label>Field Label *</Label>
                <Input value={newField.fieldLabel} onChange={(e) => setNewField({ ...newField, fieldLabel: e.target.value })} placeholder="e.g. Business Name" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Field Type</Label>
                <Select value={newField.fieldType} onValueChange={(val) => setNewField({ ...newField, fieldType: val as ProcessorField["fieldType"] })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((t) => (<SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Maps To</Label>
                <Select value={newField.mapsTo || ""} onValueChange={(val) => setNewField({ ...newField, mapsTo: val })}>
                  <SelectTrigger><SelectValue placeholder="Select mapping" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {MAPS_TO_OPTIONS.map((m) => (<SelectItem key={m} value={m}>{m}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Section</Label>
                <Input value={newField.section || ""} onChange={(e) => setNewField({ ...newField, section: e.target.value })} placeholder="e.g. Business Info" />
              </div>
              <div className="flex items-center justify-between pt-6">
                <Label>Required</Label>
                <Switch checked={newField.required} onCheckedChange={(checked) => setNewField({ ...newField, required: checked })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input value={newField.description || ""} onChange={(e) => setNewField({ ...newField, description: e.target.value })} placeholder="Help text for this field" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddFieldOpen(false)}>Cancel</Button>
            <Button onClick={addField}>Add Field</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
