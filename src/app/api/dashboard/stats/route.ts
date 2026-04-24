import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications, phoneLines } from "@/db/schema";
import { sql, eq } from "drizzle-orm";

export async function GET() {
  try {
    const stageCounts = await db
      .select({
        stage: applications.stage,
        count: sql<number>`count(*)::int`,
      })
      .from(applications)
      .groupBy(applications.stage);

    // Build stageBreakdown as an object { draft: 0, submitted: 3, ... }
    const stageBreakdown: Record<string, number> = {};
    for (const s of stageCounts) {
      stageBreakdown[s.stage] = s.count;
    }

    const totalApplications = stageCounts.reduce(
      (sum, s) => sum + s.count,
      0
    );
    const approved = stageBreakdown["approved"] || 0;
    const denied = stageBreakdown["denied"] || 0;
    const live = stageBreakdown["live"] || 0;

    const pendingReview =
      (stageBreakdown["submitted"] || 0) +
      (stageBreakdown["under_review"] || 0) +
      (stageBreakdown["info_requested"] || 0);

    const approvalRate =
      approved + denied > 0
        ? Math.round((approved / (approved + denied)) * 100)
        : 0;

    // Count available phone lines
    const availablePhones = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(phoneLines)
      .where(eq(phoneLines.status, "available"));

    const availablePhoneLines = availablePhones[0]?.count || 0;

    // Recent activity (empty for now — will populate when applications exist)
    const recentActivity: Array<{
      id: number;
      action: string;
      entity: string;
      entityName: string;
      timestamp: string;
    }> = [];

    return NextResponse.json({
      totalApplications,
      approvedMids: approved + live,
      denied,
      approvalRate,
      pendingReview,
      availablePhoneLines,
      stageBreakdown,
      stageCounts,
      recentActivity,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
