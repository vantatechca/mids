import { NextResponse } from "next/server";
import { db } from "@/db";
import { phoneLines } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    const [item] = await db
      .select()
      .from(phoneLines)
      .where(eq(phoneLines.id, Number(params.id)));
    if (!item)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(item);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch phone line" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const [updated] = await db
      .update(phoneLines)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(phoneLines.id, Number(params.id)))
      .returning();
    if (!updated)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update phone line" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _: Request,
  { params }: { params: { id: string } }
) {
  try {
    await db.delete(phoneLines).where(eq(phoneLines.id, Number(params.id)));
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete phone line" },
      { status: 500 }
    );
  }
}
