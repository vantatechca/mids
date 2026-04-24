import { NextResponse } from "next/server";
import { db } from "@/db";
import { existingAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@/lib/api-auth";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAuth();
  if (error) return error;

  try {
    const id = Number(params.id);
    const [row] = await db
      .select()
      .from(existingAccounts)
      .where(eq(existingAccounts.id, id));
    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json(row);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch account" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const id = Number(params.id);
    const body = await req.json();
    const values = {
      ...body,
      companyId: body.companyId ? Number(body.companyId) : null,
      domainId: body.domainId ? Number(body.domainId) : null,
      updatedAt: new Date(),
    };
    const [updated] = await db
      .update(existingAccounts)
      .set(values)
      .where(eq(existingAccounts.id, id))
      .returning();
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const id = Number(params.id);
    await db.delete(existingAccounts).where(eq(existingAccounts.id, id));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}