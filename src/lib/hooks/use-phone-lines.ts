import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const phoneLineKeys = {
  all: ["phone-lines"] as const,
  lists: () => [...phoneLineKeys.all, "list"] as const,
  list: (filters?: any) => [...phoneLineKeys.lists(), filters] as const,
  detail: (id: number) => [...phoneLineKeys.all, "detail", id] as const,
};

async function fetchPhoneLines() {
  const res = await fetch("/api/phones");
  if (!res.ok) throw new Error("Failed to fetch phone lines");
  return res.json();
}

async function fetchPhoneLine(id: number) {
  const res = await fetch(`/api/phones/${id}`);
  if (!res.ok) throw new Error("Failed to fetch phone line");
  return res.json();
}

async function createPhoneLine(data: any) {
  const res = await fetch("/api/phones", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create phone line");
  return res.json();
}

async function updatePhoneLine({ id, ...data }: any) {
  const res = await fetch(`/api/phones/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update phone line");
  return res.json();
}

async function deletePhoneLine(id: number) {
  const res = await fetch(`/api/phones/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete phone line");
  return res.json();
}

export function usePhoneLines() {
  return useQuery({
    queryKey: phoneLineKeys.lists(),
    queryFn: fetchPhoneLines,
  });
}

export function usePhoneLine(id: number) {
  return useQuery({
    queryKey: phoneLineKeys.detail(id),
    queryFn: () => fetchPhoneLine(id),
    enabled: !!id,
  });
}

export function useCreatePhoneLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createPhoneLine,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: phoneLineKeys.lists() });
    },
  });
}

export function useUpdatePhoneLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updatePhoneLine,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: phoneLineKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: phoneLineKeys.lists() });
    },
  });
}

export function useDeletePhoneLine() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deletePhoneLine,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: phoneLineKeys.lists() });
    },
  });
}
