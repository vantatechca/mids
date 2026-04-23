import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export const processorKeys = {
  all: ["processors"] as const,
  lists: () => [...processorKeys.all, "list"] as const,
  list: (filters?: any) => [...processorKeys.lists(), filters] as const,
  detail: (id: number) => [...processorKeys.all, "detail", id] as const,
};

async function fetchProcessors() {
  const res = await fetch("/api/processors");
  if (!res.ok) throw new Error("Failed to fetch processors");
  return res.json();
}

async function fetchProcessor(id: number) {
  const res = await fetch(`/api/processors/${id}`);
  if (!res.ok) throw new Error("Failed to fetch processor");
  return res.json();
}

async function createProcessor(data: any) {
  const res = await fetch("/api/processors", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create processor");
  return res.json();
}

async function updateProcessor({ id, ...data }: any) {
  const res = await fetch(`/api/processors/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update processor");
  return res.json();
}

async function deleteProcessor(id: number) {
  const res = await fetch(`/api/processors/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete processor");
  return res.json();
}

export function useProcessors() {
  return useQuery({
    queryKey: processorKeys.lists(),
    queryFn: fetchProcessors,
  });
}

export function useProcessor(id: number) {
  return useQuery({
    queryKey: processorKeys.detail(id),
    queryFn: () => fetchProcessor(id),
    enabled: !!id,
  });
}

export function useCreateProcessor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProcessor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: processorKeys.lists() });
    },
  });
}

export function useUpdateProcessor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateProcessor,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: processorKeys.detail(vars.id) });
      qc.invalidateQueries({ queryKey: processorKeys.lists() });
    },
  });
}

export function useDeleteProcessor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteProcessor,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: processorKeys.lists() });
    },
  });
}
