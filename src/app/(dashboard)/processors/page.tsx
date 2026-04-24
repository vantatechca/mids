"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Plus, Search, Star, Clock, TrendingUp, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

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
  notes: string | null;
  createdAt: string;
  applicationCount?: number;
};

const COUNTRIES = [
  { value: "CA", label: "Canada", flag: "CA" },
  { value: "US", label: "United States", flag: "US" },
  { value: "GB", label: "United Kingdom", flag: "GB" },
  { value: "EU", label: "European Union", flag: "EU" },
];

const INTEGRATION_TYPES = ["api", "portal", "email", "manual", "hybrid"];

const emptyForm = {
  name: "",
  websiteUrl: "",
  applicationUrl: "",
  country: "CA",
  supportsCanada: true,
  supportsUs: false,
  typicalApprovalTime: "",
  integrationType: "",
  shopifyCompatible: false,
  difficultyRating: "3",
  successRateEstimate: "",
  notes: "",
};

export default function ProcessorsPage() {
  const queryClient = useQueryClient();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState(emptyForm);

  const { data: processors = [], isLoading } = useQuery<Processor[]>({
    queryKey: ["processors"],
    queryFn: () => fetch("/api/processors").then((r) => r.json()),
  });

  const createMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      fetch("/api/processors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["processors"] });
      setSheetOpen(false);
      setFormData(emptyForm);
      toast.success("Processor created successfully");
    },
    onError: () => toast.error("Failed to create processor"),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      difficultyRating: parseInt(formData.difficultyRating) || null,
      successRateEstimate: formData.successRateEstimate ? parseInt(formData.successRateEstimate) : null,
    });
  }

  const filteredProcessors = processors.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.country?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const countryFlag = (code: string) => {
    const flags: Record<string, string> = { CA: "CA", US: "US", GB: "GB", EU: "EU" };
    return flags[code] || code;
  };

  function renderStars(rating: number | null) {
    if (!rating) return <span className="text-muted-foreground text-xs">N/A</span>;
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn("h-3.5 w-3.5", i <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300")}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Processors Database</h1>
          <p className="text-muted-foreground">Payment processor profiles and requirements</p>
        </div>
        <Button onClick={() => { setFormData(emptyForm); setSheetOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Processor
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search processors..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <p className="text-sm text-muted-foreground">{filteredProcessors.length} processors</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (<Skeleton key={i} className="h-56" />))}
        </div>
      ) : filteredProcessors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CreditCard className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">{searchQuery ? "No processors match your search" : "No processors configured yet"}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProcessors.map((processor) => (
            <Link key={processor.id} href={`/processors/${processor.id}`}>
              <Card className="h-full cursor-pointer transition-all hover:shadow-md hover:border-primary/30">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{processor.name}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">{countryFlag(processor.country)}</p>
                    </div>
                    {processor.shopifyCompatible && (
                      <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">Shopify</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Difficulty</span>
                    {renderStars(processor.difficultyRating)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Success Rate</span>
                    <span className="text-sm font-medium">
                      {processor.successRateEstimate != null ? `${processor.successRateEstimate}%` : "N/A"}
                    </span>
                  </div>
                  {processor.typicalApprovalTime && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {processor.typicalApprovalTime}
                    </div>
                  )}
                  {processor.integrationType && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <TrendingUp className="h-3 w-3" />
                      <span className="capitalize">{processor.integrationType}</span>
                    </div>
                  )}
                  {processor.applicationCount != null && (
                    <div className="pt-1 border-t">
                      <span className="text-xs text-muted-foreground">{processor.applicationCount} applications</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Add Processor</SheetTitle>
            <SheetDescription>Add a new payment processor profile</SheetDescription>
          </SheetHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-2">
              <Label htmlFor="name">Processor Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input id="websiteUrl" value={formData.websiteUrl} onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="applicationUrl">Application URL</Label>
              <Input id="applicationUrl" value={formData.applicationUrl} onChange={(e) => setFormData({ ...formData, applicationUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(val) => setFormData({ ...formData, country: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {COUNTRIES.map((c) => (<SelectItem key={c.value} value={c.value}>{c.flag} {c.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="supportsCanada">Supports Canada</Label>
              <Switch id="supportsCanada" checked={formData.supportsCanada} onCheckedChange={(checked) => setFormData({ ...formData, supportsCanada: checked })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="supportsUs">Supports US</Label>
              <Switch id="supportsUs" checked={formData.supportsUs} onCheckedChange={(checked) => setFormData({ ...formData, supportsUs: checked })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="typicalApprovalTime">Typical Approval Time</Label>
              <Input id="typicalApprovalTime" value={formData.typicalApprovalTime} onChange={(e) => setFormData({ ...formData, typicalApprovalTime: e.target.value })} placeholder="e.g. 3-5 business days" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="integrationType">Integration Type</Label>
              <Select value={formData.integrationType} onValueChange={(val) => setFormData({ ...formData, integrationType: val })}>
                <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                <SelectContent>
                  {INTEGRATION_TYPES.map((t) => (<SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="shopifyCompatible">Shopify Compatible</Label>
              <Switch id="shopifyCompatible" checked={formData.shopifyCompatible} onCheckedChange={(checked) => setFormData({ ...formData, shopifyCompatible: checked })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficultyRating">Difficulty Rating (1-5)</Label>
              <Select value={formData.difficultyRating} onValueChange={(val) => setFormData({ ...formData, difficultyRating: val })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["1", "2", "3", "4", "5"].map((r) => (<SelectItem key={r} value={r}>{r} Star{r !== "1" ? "s" : ""}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="successRateEstimate">Success Rate Estimate (%)</Label>
              <Input id="successRateEstimate" type="number" min="0" max="100" value={formData.successRateEstimate} onChange={(e) => setFormData({ ...formData, successRateEstimate: e.target.value })} placeholder="e.g. 75" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={3} />
            </div>
            <SheetFooter className="mt-6">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Processor"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
