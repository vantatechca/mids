import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const communicationKeys = {
  all: ["communications"] as const,
  lists: () => [...communicationKeys.all, "list"] as const,
  list: (filters?: any) => [...communicationKeys.lists(), filters] as const,
  detail: (id: number) => [...communicationKeys.all, "detail", id] as const,
};

async function fetchCommunications() {
  const res = await fetch("/api/communications");
  if (!res.ok) throw new Error("Failed to fetch communications");
  return res.json();
}

async function fetchCommunication(id: number) {
  const res = await fetch(`/api/communications/${id}`);
  if (!res.ok) throw new Error("Failed to fetch communication");
  return res.json();
}

async function createCommunication(data: any) {
  const res = await fetch("/api/communications", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create communication");
  return res.json();
}

async function updateCommunication({ id, ...data }: any) {
  const res = await fetch(`/api/communications/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update communication");
  return res.json();
}

async function deleteCommunication(id: number) {
  const res = await fetch(`/api/communications/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete communication");
  return res.json();
}

export function useCommunications() {
  return useQuery({
    queryKey: communicationKeys.lists(),
    queryFn: fetchCommunications,
  });
}

export function useCommunication(id: number) {
  return useQuery({
    queryKey: communicationKeys.detail(id),
    queryFn: () => fetchCommunication(id),
    enabled: !!id,
  });
}

export function useCreateCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCommunication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communicationKeys.lists() });
    },
  });
}

export function useUpdateCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCommunication,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: communicationKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: communicationKeys.lists() });
    },
  });
}

export function useDeleteCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCommunication,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: communicationKeys.lists() });
    },
  });
}
