import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const isolationRuleKeys = {
  all: ["isolation-rules"] as const,
  lists: () => [...isolationRuleKeys.all, "list"] as const,
  list: (filters?: any) => [...isolationRuleKeys.lists(), filters] as const,
  detail: (id: number) => [...isolationRuleKeys.all, "detail", id] as const,
};

async function fetchIsolationRules() {
  const res = await fetch("/api/isolation-rules");
  if (!res.ok) throw new Error("Failed to fetch isolation rules");
  return res.json();
}

async function fetchIsolationRule(id: number) {
  const res = await fetch(`/api/isolation-rules/${id}`);
  if (!res.ok) throw new Error("Failed to fetch isolation rule");
  return res.json();
}

async function createIsolationRule(data: any) {
  const res = await fetch("/api/isolation-rules", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create isolation rule");
  return res.json();
}

async function updateIsolationRule({ id, ...data }: any) {
  const res = await fetch(`/api/isolation-rules/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update isolation rule");
  return res.json();
}

async function deleteIsolationRule(id: number) {
  const res = await fetch(`/api/isolation-rules/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete isolation rule");
  return res.json();
}

export function useIsolationRules() {
  return useQuery({
    queryKey: isolationRuleKeys.lists(),
    queryFn: fetchIsolationRules,
  });
}

export function useIsolationRule(id: number) {
  return useQuery({
    queryKey: isolationRuleKeys.detail(id),
    queryFn: () => fetchIsolationRule(id),
    enabled: !!id,
  });
}

export function useCreateIsolationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createIsolationRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: isolationRuleKeys.lists() });
    },
  });
}

export function useUpdateIsolationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateIsolationRule,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: isolationRuleKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: isolationRuleKeys.lists() });
    },
  });
}

export function useDeleteIsolationRule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteIsolationRule,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: isolationRuleKeys.lists() });
    },
  });
}
