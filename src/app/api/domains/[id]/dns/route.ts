import { NextResponse } from "next/server";
import { db } from "@/db";
import { domains } from "@/db/schema";
import type { DnsRecord } from "@/db/schema/domains";
import { eq } from "drizzle-orm";
import { requireAdmin } from "@/lib/api-auth";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const domainId = Number(params.id);
    const record = (await req.json()) as DnsRecord;

    const [domain] = await db
      .select({ dnsRecords: domains.dnsRecords })
      .from(domains)
      .where(eq(domains.id, domainId));

    if (!domain) {
      return NextResponse.json({ error: "Domain not found" }, { status: 404 });
    }

    const next = [...(domain.dnsRecords ?? []), record];

    const [updated] = await db
      .update(domains)
      .set({ dnsRecords: next, updatedAt: new Date() })
      .where(eq(domains.id, domainId))
      .returning();

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to add DNS record" },
      { status: 500 }
    );
  }
}