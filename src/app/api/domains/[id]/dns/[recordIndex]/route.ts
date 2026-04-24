import { NextResponse } from "next/server";
import { db } from "@/db";
import { domains } from "@/db/schema";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; recordIndex: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const domainId = Number(params.id);
    const idx = Number(params.recordIndex);

    const [domain] = await db
      .select({ dnsRecords: domains.dnsRecords })
      .from(domains)
      .where(eq(domains.id, domainId));

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    const current = domain.dnsRecords ?? [];
    if (idx < 0 || idx >= current.length) {
      return NextResponse.json({ error: "Record index out of range" }, { status: 400 });
    }

    const next = current.filter((_, i) => i !== idx);

    const [updated] = await db
      .update(domains)
      .set({ dnsRecords: next, updatedAt: new Date() })
      .where(eq(domains.id, domainId))
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to delete DNS record" },
      { status: 500 }
    );
  }
}