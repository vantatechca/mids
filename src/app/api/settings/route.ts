import { NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/api-auth";

type AppSettings = {
  appName: string;
  timezone: string;
  defaultCurrency: string;
  notificationsEnabled: boolean;
  emailNotifications: boolean;
  autoAssignPhones: boolean;
  defaultPriority: number;
};

const defaults: AppSettings = {
  appName: "MID Factory",
  timezone: "America/Toronto",
  defaultCurrency: "CAD",
  notificationsEnabled: true,
  emailNotifications: false,
  autoAssignPhones: false,
  defaultPriority: 5,
};

let current: AppSettings = { ...defaults };

export async function GET() {
  const { error } = await requireAuth();
  if (error) return error;
  return NextResponse.json(current);
}

export async function PUT(req: Request) {
  const { error } = await requireAdmin();
  if (error) return error;

  try {
    const body = (await req.json()) as Partial<AppSettings>;
    current = { ...current, ...body };
    return NextResponse.json(current);
  } catch {
    return NextResponse.json(
      { error: "Failed to save settings" },
      { status: 500 }
    );
  }
}