"use client";

import { Suspense, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, ArrowRight, Building2, CreditCard, Phone, Globe, User, Mail, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

type Company = { id: number; legalName: string; tradeName: string | null; status: string };
type Processor = { id: number; name: string; country: string };
type PhoneLine = { id: number; phoneNumber: string; carrier: string | null; deviceLabel: string | null; status: string };
type Domain = { id: number; domainName: string; status: string };
type Identity = { id: number; personName: string; idType: string | null };

const STEPS = [
  { title: "Select Company", icon: Building2, description: "Choose the company entity for this application" },
  { title: "Select Processor", icon: CreditCard, description: "Choose the payment processor to apply to" },
  { title: "Assign Phone", icon: Phone, description: "Assign a phone line for verification" },
  { title: "Assign Domain", icon: Globe, description: "Assign a domain for this application" },
  { title: "Assign Identity", icon: User, description: "Link an identity for KYC" },
  { title: "Email & Submit", icon: Mail, description: "Set the email address and submit" },
];

export default function NewApplicationPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}>
      <NewApplicationContent />
    </Suspense>
  );
}

function NewApplicationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState(0);
  const [formData, setFormData] = useState({
    companyId: searchParams.get("companyId") || "",
    processorId: searchParams.get("processorId") || "",
    phoneLineId: "",
    domainId: "",
    identityId: "",
    emailAddress: "",
  });

  const { data: companies = [], isLoading: loadingCompanies } = useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: () => fetch("/api/companies").then((r) => r.json()),
  });

  const { data: processors = [], isLoading: loadingProcessors } = useQuery<Processor[]>({
    queryKey: ["processors"],
    queryFn: () => fetch("/api/processors").then((r) => r.json()),
  });

  const { data: phones = [], isLoading: loadingPhones } = useQuery<PhoneLine[]>({
    queryKey: ["phones"],
    queryFn: () => fetch("/api/phones").then((r) => r.json()),
  });

  const { data: domains = [], isLoading: loadingDomains } = useQuery<Domain[]>({
    queryKey: ["domains"],
    queryFn: () => fetch("/api/domains").then((r) => r.json()),
  });

  const { data: identities = [], isLoading: loadingIdentities } = useQuery<Identity[]>({
    queryKey: ["identities"],
    queryFn: () => fetch("/api/identities").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: (data) => {
      toast.success("Application created successfully");
      router.push(`/applications/${data.id || ""}`);
    },
    onError: () => toast.error("Failed to create application"),
  });

  function handleSubmit() {
    if (!formData.companyId || !formData.processorId) {
      toast.error("Company and processor are required");
      return;
    }
    createMutation.mutate({
      companyId: parseInt(formData.companyId),
      processorId: parseInt(formData.processorId),
      phoneLineId: formData.phoneLineId ? parseInt(formData.phoneLineId) : null,
      domainId: formData.domainId ? parseInt(formData.domainId) : null,
      identityId: formData.identityId ? parseInt(formData.identityId) : null,
      emailAddress: formData.emailAddress || null,
      stage: "draft",
    });
  }

  const canProceed = () => {
    switch (step) {
      case 0: return !!formData.companyId;
      case 1: return !!formData.processorId;
      default: return true;
    }
  };

  const availablePhones = phones.filter((p) => p.status === "available");
  const availableDomains = domains.filter((d) => d.status === "available");

  const selectedCompany = companies.find((c) => c.id.toString() === formData.companyId);
  const selectedProcessor = processors.find((p) => p.id.toString() === formData.processorId);
  const selectedPhone = phones.find((p) => p.id.toString() === formData.phoneLineId);
  const selectedDomain = domains.find((d) => d.id.toString() === formData.domainId);
  const selectedIdentity = identities.find((i) => i.id.toString() === formData.identityId);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/applications" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">New Application</h1>
          <p className="text-muted-foreground">Create a new MID application</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-1">
        {STEPS.map((s, i) => (
          <div key={i} className="flex items-center gap-1 flex-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors w-full",
                i === step && "bg-primary text-primary-foreground",
                i < step && "bg-green-100 text-green-700 cursor-pointer hover:bg-green-200",
                i > step && "bg-muted text-muted-foreground"
              )}
            >
              {i < step ? (
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
              ) : (
                <s.icon className="h-4 w-4 flex-shrink-0" />
              )}
              <span className="truncate hidden md:inline">{s.title}</span>
              <span className="md:hidden">{i + 1}</span>
            </button>
          </div>
        ))}
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[step].title}</CardTitle>
          <CardDescription>{STEPS[step].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {step === 0 && (
            <div className="space-y-4">
              {loadingCompanies ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={formData.companyId} onValueChange={(val) => setFormData({ ...formData, companyId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a company..." />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.filter((c) => c.status === "active").map((company) => (
                      <SelectItem key={company.id} value={company.id.toString()}>
                        {company.legalName}{company.tradeName ? ` (${company.tradeName})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedCompany && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="font-medium text-sm text-green-800">Selected: {selectedCompany.legalName}</p>
                  {selectedCompany.tradeName && <p className="text-xs text-green-600 mt-1">DBA: {selectedCompany.tradeName}</p>}
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              {loadingProcessors ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={formData.processorId} onValueChange={(val) => setFormData({ ...formData, processorId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a processor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {processors.map((processor) => (
                      <SelectItem key={processor.id} value={processor.id.toString()}>
                        {processor.name} ({processor.country})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {selectedProcessor && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                  <p className="font-medium text-sm text-green-800">Selected: {selectedProcessor.name}</p>
                  <p className="text-xs text-green-600 mt-1">Country: {selectedProcessor.country}</p>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {loadingPhones ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <Select value={formData.phoneLineId} onValueChange={(val) => setFormData({ ...formData, phoneLineId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a phone line (optional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePhones.map((phone) => (
                        <SelectItem key={phone.id} value={phone.id.toString()}>
                          {phone.phoneNumber}{phone.carrier ? ` (${phone.carrier})` : ""}{phone.deviceLabel ? ` - ${phone.deviceLabel}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{availablePhones.length} phone lines available</p>
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              {loadingDomains ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <>
                  <Select value={formData.domainId} onValueChange={(val) => setFormData({ ...formData, domainId: val })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a domain (optional)..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableDomains.map((domain) => (
                        <SelectItem key={domain.id} value={domain.id.toString()}>
                          {domain.domainName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{availableDomains.length} domains available</p>
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              {loadingIdentities ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select value={formData.identityId} onValueChange={(val) => setFormData({ ...formData, identityId: val })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an identity (optional)..." />
                  </SelectTrigger>
                  <SelectContent>
                    {identities.map((identity) => (
                      <SelectItem key={identity.id} value={identity.id.toString()}>
                        {identity.personName}{identity.idType ? ` (${identity.idType.replace(/_/g, " ")})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="emailAddress">Email Address</Label>
                <Input
                  id="emailAddress"
                  type="email"
                  value={formData.emailAddress}
                  onChange={(e) => setFormData({ ...formData, emailAddress: e.target.value })}
                  placeholder="application@company.com"
                />
              </div>

              {/* Summary */}
              <div className="space-y-2 p-4 rounded-lg bg-muted">
                <h3 className="font-medium text-sm">Application Summary</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Company:</span>
                    <span className="font-medium">{selectedCompany?.legalName || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Processor:</span>
                    <span className="font-medium">{selectedProcessor?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{selectedPhone?.phoneNumber || "Not assigned"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Domain:</span>
                    <span>{selectedDomain?.domainName || "Not assigned"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Identity:</span>
                    <span>{selectedIdentity?.personName || "Not assigned"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{formData.emailAddress || "Not set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Initial Stage:</span>
                    <Badge variant="secondary" className="bg-gray-100 text-gray-700">Draft</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canProceed()}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={createMutation.isPending || !canProceed()}>
            {createMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Application"
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
