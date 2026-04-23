import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies, processors, applications } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const companiesList = await db
      .select()
      .from(companies)
      .where(eq(companies.isDeleted, false));

    const processorsList = await db.select().from(processors);

    const apps = await db
      .select({
        id: applications.id,
        companyId: applications.companyId,
        processorId: applications.processorId,
        stage: applications.stage,
      })
      .from(applications);

    const cells: Record<string, { id: number; stage: string }> = {};
    for (const app of apps) {
      cells[`${app.companyId}-${app.processorId}`] = {
        id: app.id,
        stage: app.stage,
      };
    }

    return NextResponse.json({
      companies: companiesList,
      processors: processorsList,
      cells,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch matrix data" },
      { status: 500 }
    );
  }
}
