import { NextRequest, NextResponse } from "next/server";
import { logoutSession } from "@/modules/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    await logoutSession(authHeader);

    return NextResponse.json(
      {
        data: { success: true },
        error: null,
        meta: { message: "Logged out successfully" },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during logout",
        },
      },
      { status: 500 }
    );
  }
}
