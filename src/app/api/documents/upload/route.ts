import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/api-auth";

export async function POST() {
  const { error } = await requireAuth();
  if (error) return error;

  return NextResponse.json(
    {
      error:
        "Document upload is not configured. Connect a storage provider (S3, R2, or similar) and implement this route.",
    },
    { status: 501 }
  );
}