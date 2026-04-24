import { NextResponse } from "next/server";
import { db } from "@/db";
import { communications } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(communications)
      .orderBy(desc(communications.createdAt));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch communications" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [created] = await db
      .insert(communications)
      .values(body)
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create communication" },
      { status: 500 }
    );
  }
}
