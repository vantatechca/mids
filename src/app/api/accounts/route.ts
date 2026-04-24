import { NextResponse } from "next/server";
import { db } from "@/db";
import { existingAccounts, companies, domains } from "@/db/schema";
import { desc, eq, getTableColumns } from "drizzle-orm";
import { requireAuth, requireAdmin } from "@/lib/api-auth";

export async function GET(req: Request) {
  const { error } = await requireAuth();
  if (error) return error;

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get("platform");

  try {
    const query = db
      .select({
        ...getTableColumns(existingAccounts),
        companyName: companies.legalName,
        domainName: domains.domainName,
      })
      .from(existingAccounts)
      .leftJoin(companies, eq(existingAccounts.companyId, companies.id))
      .leftJoin(domains, eq(existingAccounts.domainId, domains.id))
      .orderBy(desc(existingAccounts.createdAt));

    const data = platform
      ? await query.where(eq(existingAccounts.platform, platform))
      : await query;

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch accounts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = await req.json();
    const values = {
      ...body,
      companyId: body.companyId ? Number(body.companyId) : null,
      domainId: body.domainId ? Number(body.domainId) : null,
    };
    const [created] = await db
      .insert(existingAccounts)
      .values(values)
      .returning();
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create account" },
      { status: 500 }
    );
  }
}