export const PIPELINE_STAGES = [
  {
    value: "draft",
    label: "Draft",
    color: "#6B7280",
    bgColor: "bg-gray-100",
    textColor: "text-gray-700",
  },
  {
    value: "assets_ready",
    label: "Assets Ready",
    color: "#3B82F6",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    value: "form_filling",
    label: "Form Filling",
    color: "#06B6D4",
    bgColor: "bg-cyan-100",
    textColor: "text-cyan-700",
  },
  {
    value: "submitted",
    label: "Submitted",
    color: "#EAB308",
    bgColor: "bg-yellow-100",
    textColor: "text-yellow-700",
  },
  {
    value: "under_review",
    label: "Under Review",
    color: "#F97316",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
  },
  {
    value: "info_requested",
    label: "Info Requested",
    color: "#8B5CF6",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  {
    value: "approved",
    label: "Approved",
    color: "#22C55E",
    bgColor: "bg-green-100",
    textColor: "text-green-700",
  },
  {
    value: "denied",
    label: "Denied",
    color: "#EF4444",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  {
    value: "integration",
    label: "Integration",
    color: "#14B8A6",
    bgColor: "bg-teal-100",
    textColor: "text-teal-700",
  },
  {
    value: "live",
    label: "Live",
    color: "#15803D",
    bgColor: "bg-emerald-100",
    textColor: "text-emerald-800",
  },
  {
    value: "suspended",
    label: "Suspended",
    color: "#B91C1C",
    bgColor: "bg-red-200",
    textColor: "text-red-800",
  },
  {
    value: "closed",
    label: "Closed",
    color: "#1F2937",
    bgColor: "bg-gray-200",
    textColor: "text-gray-800",
  },
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number]["value"];

export function getStageConfig(stage: string) {
  return PIPELINE_STAGES.find((s) => s.value === stage) || PIPELINE_STAGES[0];
}
