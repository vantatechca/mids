import { NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
  try {
    const data = await db
      .select()
      .from(companies)
      .orderBy(desc(companies.createdAt));
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch companies" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const [created] = await db.insert(companies).values(body).returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create company" },
      { status: 500 }
    );
  }
}
