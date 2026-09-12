import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const authenticated = await isAdminAuthenticated(req);
  return NextResponse.json({
    authenticated,
    username: authenticated ? process.env.ADMIN_USERNAME || null : null,
  });
}
