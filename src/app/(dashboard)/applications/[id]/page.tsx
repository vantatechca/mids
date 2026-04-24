"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Copy, CheckCircle2, Circle, Save, SendHorizontal,
  Building2, User, Phone, Globe, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import { getStageConfig } from "@/lib/constants/pipeline-stages";

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

type ApplicationDetail = {
  id: number;
  companyId: number;
  processorId: number;
  domainId: number | null;
  phoneLineId: number | null;
  identityId: number | null;
  emailAddress: string | null;
  stage: string;
  formData: Record<string, unknown>;
  stageHistory: Array<{ stage: string; changedAt: string; changedBy: string; notes?: string }>;
  notes: string | null;
  priority: number;
  createdAt: string;
  company: {
    legalName: string;
    tradeName: string | null;
    taxId: string | null;
    gstHstNumber: string | null;
    registrationNumber: string | null;
    jurisdiction: string | null;
    entityType: string | null;
    registeredAddress: Record<string, string> | null;
    mailingAddress: Record<string, string> | null;
    directors: Array<{ name: string; title: string; ownershipPercent?: number }>;
    bankAccounts: Array<{ institution: string; transitNumber: string; accountNumber: string; currency: string }>;
  };
  processor: {
    name: string;
    requiredFields: ProcessorField[];
    applicationUrl: string | null;
  };
  identity: {
    personName: string;
    dateOfBirth: string | null;
    idType: string | null;
    idNumber: string | null;
  } | null;
  phoneLine: {
    phoneNumber: string;
  } | null;
  domain: {
    domainName: string;
  } | null;
};

function resolveMapping(mapsTo: string, app: ApplicationDetail): string {
  const parts = mapsTo.split(".");
  let value: unknown = app;

  for (const part of parts) {
    if (value && typeof value === "object") {
      value = (value as Record<string, unknown>)[part];
    } else {
      return "";
    }
  }

  return typeof value === "string" ? value : "";
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={handleCopy}>
      {copied ? <CheckCircle2 className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
    </Button>
  );
}

function AssetField({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <span className="text-xs font-medium text-right max-w-[200px] truncate">{value}</span>
        <CopyButton value={value} />
      </div>
    </div>
  );
}

export default function ApplicationDetailPage() {
  const params = useParams();
  const applicationId = params.id as string;
  const queryClient = useQueryClient();
  const [localFormData, setLocalFormData] = useState<Record<string, unknown>>({});
  const [initialized, setInitialized] = useState(false);

  const { data: app, isLoading } = useQuery<ApplicationDetail>({
    queryKey: ["application", applicationId],
    queryFn: () => fetch(`/api/applications/${applicationId}`).then((r) => r.json()),
    enabled: !!applicationId,
  });

  // Initialize local form data from server
  if (app && !initialized) {
    setLocalFormData(app.formData || {});
    setInitialized(true);
  }

  const saveMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch(`/api/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formData: data }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
      toast.success("Progress saved");
    },
    onError: () => toast.error("Failed to save progress"),
  });

  const updateStageMutation = useMutation({
    mutationFn: (stage: string) =>
      fetch(`/api/applications/${applicationId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["application", applicationId] });
      toast.success("Application stage updated");
    },
    onError: () => toast.error("Failed to update stage"),
  });

  // Auto-fill from mapped data
  const autoFillFormData = useMemo(() => {
    if (!app) return {};
    const auto: Record<string, string> = {};
    const fields = app.processor?.requiredFields || [];
    for (const field of fields) {
      if (field.mapsTo) {
        const val = resolveMapping(field.mapsTo, app);
        if (val) auto[field.fieldName] = val;
      }
    }
    return auto;
  }, [app]);

  function getFieldValue(fieldName: string): string {
    const val = localFormData[fieldName];
    if (val !== undefined && val !== null && val !== "") return String(val);
    return autoFillFormData[fieldName] || "";
  }

  function setFieldValue(fieldName: string, value: unknown) {
    setLocalFormData((prev) => ({ ...prev, [fieldName]: value }));
  }

  const requiredFields = useMemo(
    () => app?.processor?.requiredFields || [],
    [app?.processor?.requiredFields]
  );
  const filledCount = requiredFields.filter((f) => getFieldValue(f.fieldName)).length;
  const totalRequired = requiredFields.filter((f) => f.required).length;
  const filledRequired = requiredFields.filter((f) => f.required && getFieldValue(f.fieldName)).length;
  const progressPercent = requiredFields.length > 0 ? Math.round((filledCount / requiredFields.length) * 100) : 0;

  // Group fields by section
  const fieldsBySection = useMemo(() => {
    const sections: Record<string, ProcessorField[]> = {};
    for (const field of requiredFields) {
      const section = field.section || "General";
      if (!sections[section]) sections[section] = [];
      sections[section].push(field);
    }
    return sections;
  }, [requiredFields]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-5 gap-6">
          <Skeleton className="col-span-2 h-96" />
          <Skeleton className="col-span-3 h-96" />
        </div>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="space-y-6">
        <Link href="/applications" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />Back to Pipeline
        </Link>
        <p className="text-muted-foreground">Application not found.</p>
      </div>
    );
  }

  const stageConfig = getStageConfig(app.stage);

  return (
    <div className="space-y-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/applications" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold">{app.company?.legalName}</h1>
              <Badge className={cn(stageConfig.bgColor, stageConfig.textColor, "border-0")}>
                {stageConfig.label}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{app.processor?.name} - Application #{app.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => saveMutation.mutate(localFormData)} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Progress
          </Button>
          <Button
            onClick={() => updateStageMutation.mutate("submitted")}
            disabled={updateStageMutation.isPending || app.stage === "submitted"}
          >
            <SendHorizontal className="h-4 w-4 mr-2" />
            Mark as Submitted
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">{filledCount} of {requiredFields.length} fields completed ({filledRequired}/{totalRequired} required)</span>
          <span className="font-medium">{progressPercent}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      {/* Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        {/* Left Panel - Asset Data */}
        <div className="lg:col-span-2 space-y-4 overflow-y-auto">
          {/* Company Section */}
          <Card>
            <CardHeader className="py-3 px-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <CardTitle className="text-sm">Company</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4 space-y-0.5">
              <AssetField label="Legal Name" value={app.company?.legalName} />
              <AssetField label="Trade Name" value={app.company?.tradeName} />
              <AssetField label="Tax ID" value={app.company?.taxId} />
              <AssetField label="GST/HST" value={app.company?.gstHstNumber} />
              <AssetField label="Reg. Number" value={app.company?.registrationNumber} />
              <AssetField label="Jurisdiction" value={app.company?.jurisdiction} />
              <AssetField label="Entity Type" value={app.company?.entityType} />
              {app.company?.registeredAddress && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs font-medium text-muted-foreground">Registered Address</p>
                  <AssetField label="Street" value={app.company.registeredAddress.street} />
                  <AssetField label="City" value={app.company.registeredAddress.city} />
                  <AssetField label="Province" value={app.company.registeredAddress.province} />
                  <AssetField label="Postal Code" value={app.company.registeredAddress.postalCode} />
                  <AssetField label="Country" value={app.company.registeredAddress.country} />
                </>
              )}
              {app.company?.directors && app.company.directors.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs font-medium text-muted-foreground">Directors</p>
                  {app.company.directors.map((d, i) => (
                    <AssetField key={i} label={d.title || "Director"} value={d.name} />
                  ))}
                </>
              )}
              {app.company?.bankAccounts && app.company.bankAccounts.length > 0 && (
                <>
                  <Separator className="my-2" />
                  <p className="text-xs font-medium text-muted-foreground">Bank Accounts</p>
                  {app.company.bankAccounts.map((b, i) => (
                    <AssetField key={i} label={b.institution} value={`Transit: ${b.transitNumber} | Acct: ${b.accountNumber}`} />
                  ))}
                </>
              )}
            </CardContent>
          </Card>

          {/* Identity Section */}
          {app.identity && (
            <Card>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Identity</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-0.5">
                <AssetField label="Name" value={app.identity.personName} />
                <AssetField label="Date of Birth" value={app.identity.dateOfBirth} />
                <AssetField label="ID Type" value={app.identity.idType?.replace(/_/g, " ")} />
                <AssetField label="ID Number" value={app.identity.idNumber} />
              </CardContent>
            </Card>
          )}

          {/* Phone Section */}
          {app.phoneLine && (
            <Card>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Phone Line</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <AssetField label="Phone Number" value={app.phoneLine.phoneNumber} />
              </CardContent>
            </Card>
          )}

          {/* Domain Section */}
          {app.domain && (
            <Card>
              <CardHeader className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm">Domain</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-4 pb-4">
                <AssetField label="Domain" value={app.domain.domainName} />
              </CardContent>
            </Card>
          )}

          {/* Email */}
          {app.emailAddress && (
            <Card>
              <CardContent className="p-4">
                <AssetField label="Email" value={app.emailAddress} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Panel - Processor Fields */}
        <div className="lg:col-span-3 space-y-4 overflow-y-auto">
          {app.processor?.applicationUrl && (
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
              <p className="text-sm text-blue-800">
                Application portal:{" "}
                <a href={app.processor.applicationUrl} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                  {app.processor.applicationUrl}
                </a>
              </p>
            </div>
          )}

          {requiredFields.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground text-sm">No required fields defined for this processor</p>
                <p className="text-xs text-muted-foreground mt-1">Add fields in the processor settings</p>
              </CardContent>
            </Card>
          ) : (
            Object.entries(fieldsBySection).map(([section, fields]) => (
              <Card key={section}>
                <CardHeader className="py-3 px-4">
                  <CardTitle className="text-sm">{section}</CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-3">
                  {fields.map((field) => {
                    const value = getFieldValue(field.fieldName);
                    const isFilled = !!value;
                    return (
                      <div key={field.fieldName} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          {isFilled ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-600 flex-shrink-0" />
                          ) : (
                            <Circle className="h-3.5 w-3.5 text-gray-300 flex-shrink-0" />
                          )}
                          <Label className="text-xs">
                            {field.fieldLabel}
                            {field.required && <span className="text-red-500 ml-0.5">*</span>}
                          </Label>
                          {field.mapsTo && (
                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 ml-auto">
                              Auto
                            </Badge>
                          )}
                        </div>
                        {field.fieldType === "textarea" ? (
                          <Textarea
                            value={String(value)}
                            onChange={(e) => setFieldValue(field.fieldName, e.target.value)}
                            placeholder={field.description || field.fieldLabel}
                            rows={3}
                            className="text-sm"
                          />
                        ) : field.fieldType === "select" && field.options ? (
                          <Select value={String(value)} onValueChange={(val) => setFieldValue(field.fieldName, val)}>
                            <SelectTrigger className="h-9 text-sm">
                              <SelectValue placeholder={`Select ${field.fieldLabel.toLowerCase()}...`} />
                            </SelectTrigger>
                            <SelectContent>
                              {field.options.map((opt) => (
                                <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : field.fieldType === "date" ? (
                          <Input
                            type="date"
                            value={String(value)}
                            onChange={(e) => setFieldValue(field.fieldName, e.target.value)}
                            className="h-9 text-sm"
                          />
                        ) : field.fieldType === "number" ? (
                          <Input
                            type="number"
                            value={String(value)}
                            onChange={(e) => setFieldValue(field.fieldName, e.target.value)}
                            placeholder={field.description || field.fieldLabel}
                            className="h-9 text-sm"
                          />
                        ) : (
                          <Input
                            value={String(value)}
                            onChange={(e) => setFieldValue(field.fieldName, e.target.value)}
                            placeholder={field.description || field.fieldLabel}
                            className="h-9 text-sm"
                          />
                        )}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
