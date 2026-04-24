import { NextResponse } from "next/server";
import { db } from "@/db";
import { applications, companies, processors } from "@/db/schema";
import { desc, eq, getTableColumns } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select({
        ...getTableColumns(applications),
        companyName: companies.legalName,
        processorName: processors.name,
      })
      .from(applications)
      .leftJoin(companies, eq(applications.companyId, companies.id))
      .leftJoin(processors, eq(applications.processorId, processors.id))
      .orderBy(desc(applications.createdAt));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [created] = await db
      .insert(applications)
      .values(body)
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create application" },
      { status: 500 }
    );
  }
}
