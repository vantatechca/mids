"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  PIPELINE_STAGES,
  getStageConfig,
} from "@/lib/constants/pipeline-stages";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Filter } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Link from "next/link";

type Application = {
  id: number;
  companyId: number;
  companyName: string;
  processorId: number;
  processorName: string;
  stage: string;
  emailAddress: string | null;
  phoneNumber: string | null;
  domainName: string | null;
  priority: number;
  createdAt: string;
};

type Processor = {
  id: number;
  name: string;
};

type Company = {
  id: number;
  legalName: string;
};

function KanbanCard({ application }: { application: Application }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: application.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Link href={`/applications/${application.id}`}>
        <Card className="mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
          <CardContent className="p-3">
            <p className="font-medium text-sm truncate">
              {application.companyName}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {application.processorName}
            </p>
            {application.emailAddress && (
              <p className="text-xs text-muted-foreground mt-1 truncate">
                {application.emailAddress}
              </p>
            )}
            <div className="flex items-center gap-1.5 mt-2">
              {application.phoneNumber && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 h-5"
                >
                  {application.phoneNumber}
                </Badge>
              )}
              {application.priority && application.priority <= 3 && (
                <Badge
                  variant="secondary"
                  className="text-[10px] px-1.5 py-0 h-5 bg-red-100 text-red-700"
                >
                  P{application.priority}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

function KanbanCardOverlay({ application }: { application: Application }) {
  return (
    <Card className="cursor-grabbing shadow-xl w-[260px]">
      <CardContent className="p-3">
        <p className="font-medium text-sm">{application.companyName}</p>
        <p className="text-xs text-muted-foreground">
          {application.processorName}
        </p>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({
  stage,
  applications,
}: {
  stage: (typeof PIPELINE_STAGES)[number];
  applications: Application[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.value });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-w-[280px] max-w-[280px] flex flex-col bg-muted/50 rounded-lg",
        isOver && "ring-2 ring-primary bg-primary/5"
      )}
    >
      <div
        className="flex items-center gap-2 p-3 rounded-t-lg"
        style={{ borderTop: `3px solid ${stage.color}` }}
      >
        <span className="font-medium text-sm">{stage.label}</span>
        <Badge variant="secondary" className="ml-auto text-xs">
          {applications.length}
        </Badge>
      </div>
      <div className="flex-1 overflow-y-auto p-2 min-h-[200px]">
        <SortableContext
          items={applications.map((a) => a.id)}
          strategy={verticalListSortingStrategy}
        >
          {applications.map((app) => (
            <KanbanCard key={app.id} application={app} />
          ))}
        </SortableContext>
        {applications.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted-foreground">
            Drop here
          </div>
        )}
      </div>
    </div>
  );
}

export default function ApplicationsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [processorFilter, setProcessorFilter] = useState("all");
  const [companyFilter, setCompanyFilter] = useState("all");
  const [activeApp, setActiveApp] = useState<Application | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["applications"],
    queryFn: () => fetch("/api/applications").then((r) => r.json()),
  });

  const { data: processors = [] } = useQuery<Processor[]>({
    queryKey: ["processors-list"],
    queryFn: () => fetch("/api/processors").then((r) => r.json()),
  });

  const { data: companies = [] } = useQuery<Company[]>({
    queryKey: ["companies-list"],
    queryFn: () => fetch("/api/companies").then((r) => r.json()),
  });

  const updateStageMutation = useMutation({
    mutationFn: ({
      applicationId,
      stage,
    }: {
      applicationId: number;
      stage: string;
    }) =>
      fetch(`/api/applications/${applicationId}/stage`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage }),
      }).then((r) => r.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: () => toast.error("Failed to update application stage"),
  });

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      app.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.processorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.emailAddress?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProcessor =
      processorFilter === "all" ||
      app.processorId.toString() === processorFilter;
    const matchesCompany =
      companyFilter === "all" || app.companyId.toString() === companyFilter;
    return matchesSearch && matchesProcessor && matchesCompany;
  });

  const applicationsByStage = PIPELINE_STAGES.reduce(
    (acc, stage) => {
      acc[stage.value] = filteredApplications.filter(
        (a) => a.stage === stage.value
      );
      return acc;
    },
    {} as Record<string, Application[]>
  );

  function handleDragStart(event: DragStartEvent) {
    const app = filteredApplications.find((a) => a.id === event.active.id);
    setActiveApp(app || null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveApp(null);
    const { active, over } = event;
    if (!over) return;

    const applicationId = active.id as number;
    const app = applications.find((a) => a.id === applicationId);
    if (!app) return;

    // Determine target stage
    let targetStage: string | null = null;

    // Check if dropped on a column
    const isStage = PIPELINE_STAGES.some((s) => s.value === over.id);
    if (isStage) {
      targetStage = over.id as string;
    } else {
      // Dropped on another card -- find which stage that card is in
      const targetApp = applications.find((a) => a.id === over.id);
      if (targetApp) {
        targetStage = targetApp.stage;
      }
    }

    if (targetStage && targetStage !== app.stage) {
      // Optimistic update
      queryClient.setQueryData<Application[]>(["applications"], (old) =>
        old?.map((a) =>
          a.id === applicationId ? { ...a, stage: targetStage! } : a
        )
      );
      updateStageMutation.mutate({ applicationId, stage: targetStage });
      toast.success(
        `Moved to ${getStageConfig(targetStage).label}`
      );
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[280px] h-96" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Applications Pipeline</h1>
          <p className="text-sm text-muted-foreground">
            {filteredApplications.length} applications across{" "}
            {PIPELINE_STAGES.length} stages
          </p>
        </div>
        <Button asChild>
          <Link href="/applications/new">
            <Plus className="h-4 w-4 mr-2" />
            New Application
          </Link>
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={processorFilter} onValueChange={setProcessorFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <Filter className="h-3 w-3 mr-1.5" />
            <SelectValue placeholder="All Processors" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Processors</SelectItem>
            {processors.map((p) => (
              <SelectItem key={p.id} value={p.id.toString()}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={companyFilter} onValueChange={setCompanyFilter}>
          <SelectTrigger className="w-[180px] h-9">
            <Filter className="h-3 w-3 mr-1.5" />
            <SelectValue placeholder="All Companies" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Companies</SelectItem>
            {companies.map((c) => (
              <SelectItem key={c.id} value={c.id.toString()}>
                {c.legalName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-3 overflow-x-auto pb-4 h-full">
            {PIPELINE_STAGES.map((stage) => (
              <KanbanColumn
                key={stage.value}
                stage={stage}
                applications={applicationsByStage[stage.value] || []}
              />
            ))}
          </div>
          <DragOverlay>
            {activeApp ? <KanbanCardOverlay application={activeApp} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
