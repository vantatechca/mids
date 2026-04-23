import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const identityKeys = {
  all: ["identities"] as const,
  lists: () => [...identityKeys.all, "list"] as const,
  list: (filters?: any) => [...identityKeys.lists(), filters] as const,
  detail: (id: number) => [...identityKeys.all, "detail", id] as const,
};

async function fetchIdentities() {
  const res = await fetch("/api/identities");
  if (!res.ok) throw new Error("Failed to fetch identities");
  return res.json();
}

async function fetchIdentity(id: number) {
  const res = await fetch(`/api/identities/${id}`);
  if (!res.ok) throw new Error("Failed to fetch identity");
  return res.json();
}

async function createIdentity(data: any) {
  const res = await fetch("/api/identities", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create identity");
  return res.json();
}

async function updateIdentity({ id, ...data }: any) {
  const res = await fetch(`/api/identities/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update identity");
  return res.json();
}

async function deleteIdentity(id: number) {
  const res = await fetch(`/api/identities/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete identity");
  return res.json();
}

export function useIdentities() {
  return useQuery({
    queryKey: identityKeys.lists(),
    queryFn: fetchIdentities,
  });
}

export function useIdentity(id: number) {
  return useQuery({
    queryKey: identityKeys.detail(id),
    queryFn: () => fetchIdentity(id),
    enabled: !!id,
  });
}

export function useCreateIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createIdentity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: identityKeys.lists() });
    },
  });
}

export function useUpdateIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateIdentity,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: identityKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: identityKeys.lists() });
    },
  });
}

export function useDeleteIdentity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteIdentity,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: identityKeys.lists() });
    },
  });
}
