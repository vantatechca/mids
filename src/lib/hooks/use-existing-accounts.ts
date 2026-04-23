import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const existingAccountKeys = {
  all: ["existing-accounts"] as const,
  lists: () => [...existingAccountKeys.all, "list"] as const,
  list: (filters?: any) => [...existingAccountKeys.lists(), filters] as const,
  detail: (id: number) => [...existingAccountKeys.all, "detail", id] as const,
};

async function fetchExistingAccounts() {
  const res = await fetch("/api/existing-accounts");
  if (!res.ok) throw new Error("Failed to fetch existing accounts");
  return res.json();
}

async function fetchExistingAccount(id: number) {
  const res = await fetch(`/api/existing-accounts/${id}`);
  if (!res.ok) throw new Error("Failed to fetch existing account");
  return res.json();
}

async function createExistingAccount(data: any) {
  const res = await fetch("/api/existing-accounts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create existing account");
  return res.json();
}

async function updateExistingAccount({ id, ...data }: any) {
  const res = await fetch(`/api/existing-accounts/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update existing account");
  return res.json();
}

async function deleteExistingAccount(id: number) {
  const res = await fetch(`/api/existing-accounts/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete existing account");
  return res.json();
}

export function useExistingAccounts() {
  return useQuery({
    queryKey: existingAccountKeys.lists(),
    queryFn: fetchExistingAccounts,
  });
}

export function useExistingAccount(id: number) {
  return useQuery({
    queryKey: existingAccountKeys.detail(id),
    queryFn: () => fetchExistingAccount(id),
    enabled: !!id,
  });
}

export function useCreateExistingAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createExistingAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: existingAccountKeys.lists() });
    },
  });
}

export function useUpdateExistingAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateExistingAccount,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: existingAccountKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: existingAccountKeys.lists() });
    },
  });
}

export function useDeleteExistingAccount() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExistingAccount,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: existingAccountKeys.lists() });
    },
  });
}
