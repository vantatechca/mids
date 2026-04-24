"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Mail, MessageSquare, Phone, Inbox, Eye, EyeOff, Flag, FlagOff,
  ChevronDown, ChevronUp, Search, AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Communication = {
  id: number;
  type: string;
  direction: string;
  applicationId: number | null;
  fromAddress: string | null;
  toAddress: string | null;
  subject: string | null;
  body: string | null;
  voicemailTranscription: string | null;
  isRead: boolean;
  isFlagged: boolean;
  actionNeeded: boolean;
  actionNotes: string | null;
  receivedAt: string;
  applicationName?: string;
};

function TypeIcon({ type, className }: { type: string; className?: string }) {
  switch (type) {
    case "email":
      return <Mail className={cn("h-4 w-4", className)} />;
    case "sms":
      return <MessageSquare className={cn("h-4 w-4", className)} />;
    case "call":
      return <Phone className={cn("h-4 w-4", className)} />;
    default:
      return <Inbox className={cn("h-4 w-4", className)} />;
  }
}

export default function CommunicationsPage() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState("all");
  const [readFilter, setReadFilter] = useState<"all" | "unread" | "read">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const { data: communications = [], isLoading } = useQuery<Communication[]>({
    queryKey: ["communications"],
    queryFn: () => fetch("/api/communications").then((r) => r.json()),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...data }: { id: number; isRead?: boolean; isFlagged?: boolean }) =>
      fetch(`/api/communications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["communications"] });
    },
  });

  const filtered = communications.filter((c) => {
    const matchesType = typeFilter === "all" || c.type === typeFilter;
    const matchesRead =
      readFilter === "all" ||
      (readFilter === "unread" && !c.isRead) ||
      (readFilter === "read" && c.isRead);
    const matchesSearch =
      !searchQuery ||
      c.subject?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.fromAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.toAddress?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.body?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesRead && matchesSearch;
  });

  const unreadCount = communications.filter((c) => !c.isRead).length;

  function toggleExpand(id: number) {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      const comm = communications.find((c) => c.id === id);
      if (comm && !comm.isRead) {
        updateMutation.mutate({ id, isRead: true });
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Mock Data Banner */}
      <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2">
        <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          Communications inbox is currently using stubbed data. Live integration coming soon.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Communications</h1>
          <p className="text-muted-foreground">
            Unified inbox for emails, SMS, and calls
            {unreadCount > 0 && <span className="ml-2 font-medium text-foreground">{unreadCount} unread</span>}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search communications..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>

        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="email">
              <Mail className="h-3.5 w-3.5 mr-1" />Email
            </TabsTrigger>
            <TabsTrigger value="sms">
              <MessageSquare className="h-3.5 w-3.5 mr-1" />SMS
            </TabsTrigger>
            <TabsTrigger value="call">
              <Phone className="h-3.5 w-3.5 mr-1" />Call
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Tabs value={readFilter} onValueChange={(v) => setReadFilter(v as typeof readFilter)}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="unread">Unread</TabsTrigger>
            <TabsTrigger value="read">Read</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (<Skeleton key={i} className="h-16 w-full" />))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Inbox className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No communications found</p>
            </div>
          ) : (
            <div className="divide-y">
              {filtered.map((comm) => {
                const isExpanded = expandedId === comm.id;
                return (
                  <div key={comm.id} className={cn("transition-colors", !comm.isRead && "bg-blue-50/50")}>
                    <div
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleExpand(comm.id)}
                    >
                      <div className={cn("p-2 rounded-lg", comm.type === "email" ? "bg-blue-100" : comm.type === "sms" ? "bg-green-100" : "bg-purple-100")}>
                        <TypeIcon type={comm.type} className={comm.type === "email" ? "text-blue-600" : comm.type === "sms" ? "text-green-600" : "text-purple-600"} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {!comm.isRead && <div className="h-2 w-2 rounded-full bg-blue-600 flex-shrink-0" />}
                          <span className={cn("text-sm truncate", !comm.isRead && "font-semibold")}>
                            {comm.subject || comm.fromAddress || "No subject"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-muted-foreground truncate">
                            {comm.direction === "inbound" ? `From: ${comm.fromAddress || "Unknown"}` : `To: ${comm.toAddress || "Unknown"}`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        {comm.applicationId && comm.applicationName && (
                          <Link href={`/applications/${comm.applicationId}`} onClick={(e) => e.stopPropagation()}>
                            <Badge variant="outline" className="text-xs cursor-pointer hover:bg-muted">
                              {comm.applicationName}
                            </Badge>
                          </Link>
                        )}
                        {comm.actionNeeded && (
                          <Badge variant="secondary" className="bg-red-100 text-red-700 text-xs">Action</Badge>
                        )}
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(comm.receivedAt).toLocaleDateString()}
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <Separator className="mb-3" />
                        <div className="space-y-3">
                          {comm.body && (
                            <div className="text-sm whitespace-pre-wrap bg-muted/50 rounded-lg p-3">
                              {comm.body}
                            </div>
                          )}
                          {comm.voicemailTranscription && (
                            <div className="text-sm">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Voicemail Transcription:</p>
                              <p className="bg-muted/50 rounded-lg p-3">{comm.voicemailTranscription}</p>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: comm.id, isRead: !comm.isRead }); }}
                            >
                              {comm.isRead ? <EyeOff className="h-3.5 w-3.5 mr-1" /> : <Eye className="h-3.5 w-3.5 mr-1" />}
                              {comm.isRead ? "Mark unread" : "Mark read"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => { e.stopPropagation(); updateMutation.mutate({ id: comm.id, isFlagged: !comm.isFlagged }); }}
                            >
                              {comm.isFlagged ? <FlagOff className="h-3.5 w-3.5 mr-1" /> : <Flag className="h-3.5 w-3.5 mr-1" />}
                              {comm.isFlagged ? "Unflag" : "Flag"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
