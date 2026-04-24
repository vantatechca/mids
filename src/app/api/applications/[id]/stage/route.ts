import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { StageChange } from "@/db/schema/applications";

const VALID_TRANSITIONS: Record<string, string[]> = {
  draft: ["assets_ready"],
  assets_ready: ["form_filling", "draft"],
  form_filling: ["submitted", "assets_ready"],
  submitted: ["under_review"],
  under_review: ["info_requested", "approved", "denied"],
  info_requested: ["under_review", "submitted"],
  approved: ["integration", "denied"],
  denied: ["draft"],
  integration: ["live", "approved"],
  live: ["suspended", "closed"],
  suspended: ["live", "closed"],
  closed: [],
};

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { stage, notes, changedBy } = await req.json();

    if (!stage) {
      return NextResponse.json(
        { error: "Stage is required" },
        { status: 400 }
      );
    }

    const [app] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, Number(params.id)));

    if (!app) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const allowedNext = VALID_TRANSITIONS[app.stage] || [];
    if (!allowedNext.includes(stage)) {
      return NextResponse.json(
        {
          error: `Invalid stage transition from "${app.stage}" to "${stage}". Allowed: ${allowedNext.join(", ") || "none"}`,
        },
        { status: 400 }
      );
    }

    const stageChange: StageChange = {
      stage,
      changedAt: new Date().toISOString(),
      changedBy: changedBy || "system",
      notes,
    };

    const existingHistory = (app.stageHistory || []) as StageChange[];

    const updateData: Record<string, any> = {
      stage,
      stageHistory: [...existingHistory, stageChange],
      updatedAt: new Date(),
    };

    if (stage === "submitted") {
      updateData.submittedAt = new Date();
    } else if (stage === "approved") {
      updateData.approvedAt = new Date();
    } else if (stage === "denied") {
      updateData.deniedAt = new Date();
      if (notes) updateData.denialReason = notes;
    }

    const [updated] = await db
      .update(applications)
      .set(updateData)
      .where(eq(applications.id, Number(params.id)))
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update application stage" },
      { status: 500 }
    );
  }
}
