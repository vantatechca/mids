import { NextResponse } from "next/server";
import { db } from "@/db";
import { existingAccounts } from "@/db/schema";
import { desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(existingAccounts)
      .orderBy(desc(existingAccounts.createdAt));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch existing accounts" },
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
      .insert(existingAccounts)
      .values(body)
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create existing account" },
      { status: 500 }
    );
  }
}
