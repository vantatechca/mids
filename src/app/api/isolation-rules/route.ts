import { NextResponse } from "next/server";
import { db } from "@/db";
import { isolationRules } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(isolationRules)
      .orderBy(desc(isolationRules.createdAt));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch isolation rules" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;
  try {
    const body = await req.json();
    const [created] = await db
      .insert(isolationRules)
      .values(body)
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create isolation rule" },
      { status: 500 }
    );
  }
}
