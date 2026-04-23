"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PIPELINE_STAGES, getStageConfig } from "@/lib/constants/pipeline-stages";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

type MatrixCell = {
  applicationId: number;
  stage: string;
  emailAddress: string | null;
} | null;

type MatrixData = {
  companies: Array<{ id: number; legalName: string }>;
  processors: Array<{ id: number; name: string }>;
  matrix: Record<string, Record<string, MatrixCell>>;
};

export default function MatrixPage() {
  const { data, isLoading } = useQuery<MatrixData>({
    queryKey: ["matrix"],
    queryFn: () => fetch("/api/matrix").then((r) => r.json()),
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Application Matrix</h1>
          <p className="text-muted-foreground">Company vs Processor grid</p>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const companies = data?.companies || [];
  const processors = data?.processors || [];
  const matrix = data?.matrix || {};

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Application Matrix</h1>
        <p className="text-muted-foreground">
          Overview of all company-processor application combinations
        </p>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        {PIPELINE_STAGES.map((stage) => (
          <div key={stage.value} className="flex items-center gap-1.5 text-xs">
            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: stage.color }} />
            <span className="text-muted-foreground">{stage.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-1.5 text-xs">
          <div className="h-3 w-3 rounded border border-dashed border-gray-400 flex items-center justify-center text-[8px] text-gray-400">+</div>
          <span className="text-muted-foreground">No application</span>
        </div>
      </div>

      {companies.length === 0 || processors.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">
              {companies.length === 0 ? "No companies found. Add companies first." : "No processors found. Add processors first."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-auto border rounded-lg">
          <TooltipProvider>
            <div
              className="grid min-w-max"
              style={{
                gridTemplateColumns: `200px repeat(${processors.length}, 100px)`,
              }}
            >
              {/* Header Row */}
              <div className="sticky left-0 z-20 bg-background border-b border-r p-2 font-medium text-sm flex items-center">
                Company / Processor
              </div>
              {processors.map((processor) => (
                <div
                  key={processor.id}
                  className="border-b border-r p-2 text-center bg-muted/50"
                >
                  <span className="text-xs font-medium leading-tight block truncate" title={processor.name}>
                    {processor.name}
                  </span>
                </div>
              ))}

              {/* Data Rows */}
              {companies.map((company) => (
                <>
                  <div
                    key={`company-${company.id}`}
                    className="sticky left-0 z-10 bg-background border-b border-r p-2 flex items-center"
                  >
                    <span className="text-sm font-medium truncate" title={company.legalName}>
                      {company.legalName}
                    </span>
                  </div>
                  {processors.map((processor) => {
                    const cell = matrix[company.id.toString()]?.[processor.id.toString()];
                    const cellKey = `${company.id}-${processor.id}`;

                    if (cell) {
                      const stageConfig = getStageConfig(cell.stage);
                      return (
                        <Tooltip key={cellKey}>
                          <TooltipTrigger asChild>
                            <Link
                              href={`/applications/${cell.applicationId}`}
                              className="border-b border-r p-2 flex items-center justify-center hover:bg-muted/50 transition-colors cursor-pointer"
                            >
                              <div
                                className="h-6 w-6 rounded-full"
                                style={{ backgroundColor: stageConfig.color }}
                              />
                            </Link>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="font-medium">{company.legalName} - {processor.name}</p>
                            <p className="text-xs">Stage: {stageConfig.label}</p>
                            {cell.emailAddress && <p className="text-xs">{cell.emailAddress}</p>}
                          </TooltipContent>
                        </Tooltip>
                      );
                    }

                    return (
                      <Link
                        key={cellKey}
                        href={`/applications/new?companyId=${company.id}&processorId=${processor.id}`}
                        className="border-b border-r p-2 flex items-center justify-center hover:bg-muted/30 transition-colors group"
                      >
                        <div className="h-6 w-6 rounded border border-dashed border-gray-300 flex items-center justify-center group-hover:border-primary group-hover:text-primary transition-colors">
                          <Plus className="h-3 w-3 text-gray-400 group-hover:text-primary" />
                        </div>
                      </Link>
                    );
                  })}
                </>
              ))}
            </div>
          </TooltipProvider>
        </div>
      )}
    </div>
  );
}
