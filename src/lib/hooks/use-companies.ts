import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const companyKeys = {
  all: ["companies"] as const,
  lists: () => [...companyKeys.all, "list"] as const,
  list: (filters?: any) => [...companyKeys.lists(), filters] as const,
  detail: (id: number) => [...companyKeys.all, "detail", id] as const,
};

async function fetchCompanies() {
  const res = await fetch("/api/companies");
  if (!res.ok) throw new Error("Failed to fetch companies");
  return res.json();
}

async function fetchCompany(id: number) {
  const res = await fetch(`/api/companies/${id}`);
  if (!res.ok) throw new Error("Failed to fetch company");
  return res.json();
}

async function createCompany(data: any) {
  const res = await fetch("/api/companies", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create company");
  return res.json();
}

async function updateCompany({ id, ...data }: any) {
  const res = await fetch(`/api/companies/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update company");
  return res.json();
}

async function deleteCompany(id: number) {
  const res = await fetch(`/api/companies/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete company");
  return res.json();
}

export function useCompanies() {
  return useQuery({
    queryKey: companyKeys.lists(),
    queryFn: fetchCompanies,
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: companyKeys.detail(id),
    queryFn: () => fetchCompany(id),
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

export function useUpdateCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateCompany,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: companyKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}

export function useDeleteCompany() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: companyKeys.lists() });
    },
  });
}
