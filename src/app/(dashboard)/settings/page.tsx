"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Save, Loader2, Settings } from "lucide-react";
import { toast } from "sonner";

type AppSettings = {
  appName: string;
  timezone: string;
  defaultCurrency: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  autoAssignPhones: boolean;
  defaultPriority: number;
};

const TIMEZONES = [
  "America/Toronto",
  "America/Vancouver",
  "America/Edmonton",
  "America/Winnipeg",
  "America/Halifax",
  "America/St_Johns",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "UTC",
];

const CURRENCIES = [
  { value: "CAD", label: "Canadian Dollar (CAD)" },
  { value: "USD", label: "US Dollar (USD)" },
  { value: "GBP", label: "British Pound (GBP)" },
  { value: "EUR", label: "Euro (EUR)" },
];

const defaultSettings: AppSettings = {
  appName: "MID Factory",
  timezone: "America/Toronto",
  defaultCurrency: "CAD",
  notificationsEnabled: true,
  emailNotifications: false,
  autoAssignPhones: false,
  defaultPriority: 5,
};

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<AppSettings>(defaultSettings);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: settings, isLoading } = useQuery<AppSettings>({
    queryKey: ["settings"],
    queryFn: () =>
      fetch("/api/settings")
        .then((r) => r.json())
        .catch(() => defaultSettings),
  });

  useEffect(() => {
    if (settings) {
      setFormData(settings);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data: AppSettings) =>
      fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      setHasChanges(false);
      toast.success("Settings saved successfully");
    },
    onError: () => toast.error("Failed to save settings"),
  });

  function updateField<K extends keyof AppSettings>(key: K, value: AppSettings[K]) {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    saveMutation.mutate(formData);
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">App Settings</h1>
        <p className="text-muted-foreground">Configure application preferences</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              General Settings
            </CardTitle>
            <CardDescription>Configure core application settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="appName">Application Name</Label>
              <Input
                id="appName"
                value={formData.appName}
                onChange={(e) => updateField("appName", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={formData.timezone} onValueChange={(val) => updateField("timezone", val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultCurrency">Default Currency</Label>
              <Select value={formData.defaultCurrency} onValueChange={(val) => updateField("defaultCurrency", val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultPriority">Default Priority (1-10)</Label>
              <Input
                id="defaultPriority"
                type="number"
                min="1"
                max="10"
                value={formData.defaultPriority}
                onChange={(e) => updateField("defaultPriority", parseInt(e.target.value) || 5)}
              />
              <p className="text-xs text-muted-foreground">Lower numbers = higher priority</p>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notifications</h3>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notificationsEnabled">Enable Notifications</Label>
                  <p className="text-xs text-muted-foreground">Receive in-app notifications</p>
                </div>
                <Switch
                  id="notificationsEnabled"
                  checked={formData.notificationsEnabled}
                  onCheckedChange={(checked) => updateField("notificationsEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailNotifications">Email Notifications</Label>
                  <p className="text-xs text-muted-foreground">Send notifications via email</p>
                </div>
                <Switch
                  id="emailNotifications"
                  checked={formData.emailNotifications}
                  onCheckedChange={(checked) => updateField("emailNotifications", checked)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Automation</h3>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="autoAssignPhones">Auto-Assign Phone Lines</Label>
                  <p className="text-xs text-muted-foreground">Automatically assign available phone lines to new applications</p>
                </div>
                <Switch
                  id="autoAssignPhones"
                  checked={formData.autoAssignPhones}
                  onCheckedChange={(checked) => updateField("autoAssignPhones", checked)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={saveMutation.isPending || !hasChanges}>
                {saveMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</>
                ) : (
                  <><Save className="h-4 w-4 mr-2" />Save Settings</>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
