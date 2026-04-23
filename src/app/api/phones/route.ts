import { NextResponse } from "next/server";
import { db } from "@/db";
import { phoneLines } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(phoneLines)
      .orderBy(desc(phoneLines.createdAt));
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch phone lines" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [created] = await db.insert(phoneLines).values(body).returning();
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create phone line" },
      { status: 500 }
    );
  }
}
