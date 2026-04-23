"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PIPELINE_STAGES,
  getStageConfig,
} from "@/lib/constants/pipeline-stages";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Building2,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Phone,
} from "lucide-react";

type DashboardStats = {
  totalApplications: number;
  approvedMids: number;
  pendingReview: number;
  denied: number;
  approvalRate: number;
  availablePhoneLines: number;
  stageBreakdown: Record<string, number>;
  recentActivity: Array<{
    id: number;
    action: string;
    entity: string;
    entityName: string;
    timestamp: string;
  }>;
};

const defaultStats: DashboardStats = {
  totalApplications: 0,
  approvedMids: 0,
  pendingReview: 0,
  denied: 0,
  approvalRate: 0,
  availablePhoneLines: 0,
  stageBreakdown: {},
  recentActivity: [],
};

export default function DashboardPage() {
  const { data: stats = defaultStats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["dashboard"],
    queryFn: () => fetch("/api/dashboard/stats").then((r) => r.json()),
  });

  const summaryCards = [
    {
      title: "Total Applications",
      value: stats.totalApplications,
      icon: Building2,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Approved MIDs",
      value: stats.approvedMids,
      icon: CheckCircle2,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Pending Review",
      value: stats.pendingReview,
      icon: Clock,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Denied",
      value: stats.denied,
      icon: XCircle,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Approval Rate",
      value: `${stats.approvalRate}%`,
      icon: TrendingUp,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Available Phone Lines",
      value: stats.availablePhoneLines,
      icon: Phone,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  const stageChartData = PIPELINE_STAGES.map((stage) => ({
    name: stage.label,
    value: stats.stageBreakdown[stage.value] || 0,
    color: stage.color,
  }));

  const totalInPipeline = stageChartData.reduce((sum, s) => sum + s.value, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your MID application pipeline
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title}>
            <CardContent className="p-4">
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                </div>
              ) : (
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {card.title}
                    </p>
                    <p className="text-2xl font-bold mt-1">{card.value}</p>
                  </div>
                  <div className={`p-2 rounded-lg ${card.bgColor}`}>
                    <card.icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Overview Bar */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pipeline Overview</CardTitle>
          <CardDescription>
            Application distribution across stages
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-full" />
          ) : totalInPipeline > 0 ? (
            <div className="space-y-3">
              <div className="flex h-8 rounded-lg overflow-hidden">
                {stageChartData
                  .filter((s) => s.value > 0)
                  .map((stage) => (
                    <div
                      key={stage.name}
                      className="flex items-center justify-center text-xs font-medium text-white transition-all hover:opacity-80"
                      style={{
                        backgroundColor: stage.color,
                        width: `${(stage.value / totalInPipeline) * 100}%`,
                        minWidth: stage.value > 0 ? "24px" : 0,
                      }}
                      title={`${stage.name}: ${stage.value}`}
                    >
                      {stage.value}
                    </div>
                  ))}
              </div>
              <div className="flex flex-wrap gap-3">
                {stageChartData
                  .filter((s) => s.value > 0)
                  .map((stage) => (
                    <div
                      key={stage.name}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="text-muted-foreground">
                        {stage.name}
                      </span>
                      <span className="font-medium">{stage.value}</span>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No applications yet
            </p>
          )}
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Applications by Stage Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Applications by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stageChartData} margin={{ bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    angle={-45}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid hsl(var(--border))",
                      backgroundColor: "hsl(var(--card))",
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {stageChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Approval Rate Gauge */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-64 w-full" />
            ) : (
              <div className="flex flex-col items-center justify-center h-[280px]">
                <div className="relative h-40 w-40">
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke={
                        stats.approvalRate >= 70
                          ? "#22C55E"
                          : stats.approvalRate >= 40
                          ? "#EAB308"
                          : "#EF4444"
                      }
                      strokeWidth="8"
                      strokeDasharray={`${stats.approvalRate * 2.51} 251`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-3xl font-bold">
                      {stats.approvalRate}%
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  {stats.approvedMids} approved of {stats.totalApplications} total
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : stats.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {stats.recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <div>
                      <p className="text-sm font-medium">
                        {activity.action}{" "}
                        <span className="text-muted-foreground">
                          {activity.entity}
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.entityName}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">
                No recent activity
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Activity will appear here as you manage applications
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
