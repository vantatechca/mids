import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const applicationKeys = {
  all: ["applications"] as const,
  lists: () => [...applicationKeys.all, "list"] as const,
  list: (filters?: any) => [...applicationKeys.lists(), filters] as const,
  detail: (id: number) => [...applicationKeys.all, "detail", id] as const,
};

async function fetchApplications() {
  const res = await fetch("/api/applications");
  if (!res.ok) throw new Error("Failed to fetch applications");
  return res.json();
}

async function fetchApplication(id: number) {
  const res = await fetch(`/api/applications/${id}`);
  if (!res.ok) throw new Error("Failed to fetch application");
  return res.json();
}

async function createApplication(data: any) {
  const res = await fetch("/api/applications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create application");
  return res.json();
}

async function updateApplication({ id, ...data }: any) {
  const res = await fetch(`/api/applications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update application");
  return res.json();
}

async function deleteApplication(id: number) {
  const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete application");
  return res.json();
}

async function updateApplicationStage({
  id,
  stage,
  notes,
  changedBy,
}: {
  id: number;
  stage: string;
  notes?: string;
  changedBy?: string;
}) {
  const res = await fetch(`/api/applications/${id}/stage`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ stage, notes, changedBy }),
  });
  if (!res.ok) throw new Error("Failed to update application stage");
  return res.json();
}

export function useApplications() {
  return useQuery({
    queryKey: applicationKeys.lists(),
    queryFn: fetchApplications,
  });
}

export function useApplication(id: number) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: () => fetchApplication(id),
    enabled: !!id,
  });
}

export function useCreateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createApplication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useUpdateApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateApplication,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: applicationKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useDeleteApplication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteApplication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}

export function useUpdateApplicationStage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateApplicationStage,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: applicationKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: applicationKeys.lists() });
    },
  });
}
