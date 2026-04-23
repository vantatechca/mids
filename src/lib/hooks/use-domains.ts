import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const domainKeys = {
  all: ["domains"] as const,
  lists: () => [...domainKeys.all, "list"] as const,
  list: (filters?: any) => [...domainKeys.lists(), filters] as const,
  detail: (id: number) => [...domainKeys.all, "detail", id] as const,
};

async function fetchDomains() {
  const res = await fetch("/api/domains");
  if (!res.ok) throw new Error("Failed to fetch domains");
  return res.json();
}

async function fetchDomain(id: number) {
  const res = await fetch(`/api/domains/${id}`);
  if (!res.ok) throw new Error("Failed to fetch domain");
  return res.json();
}

async function createDomain(data: any) {
  const res = await fetch("/api/domains", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create domain");
  return res.json();
}

async function updateDomain({ id, ...data }: any) {
  const res = await fetch(`/api/domains/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update domain");
  return res.json();
}

async function deleteDomain(id: number) {
  const res = await fetch(`/api/domains/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete domain");
  return res.json();
}

export function useDomains() {
  return useQuery({
    queryKey: domainKeys.lists(),
    queryFn: fetchDomains,
  });
}

export function useDomain(id: number) {
  return useQuery({
    queryKey: domainKeys.detail(id),
    queryFn: () => fetchDomain(id),
    enabled: !!id,
  });
}

export function useCreateDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDomain,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: domainKeys.lists() });
    },
  });
}

export function useUpdateDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDomain,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: domainKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: domainKeys.lists() });
    },
  });
}

export function useDeleteDomain() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDomain,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: domainKeys.lists() });
    },
  });
}
