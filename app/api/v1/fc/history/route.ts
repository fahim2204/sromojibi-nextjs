import { NextRequest, NextResponse } from "next/server";
import { verifyCollectorToken, getCollectorHistory, FcServiceError } from "@/modules/fc/fc.service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim() || "";
    const collector = await verifyCollectorToken(token);

    const { searchParams } = new URL(req.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));

    const history = await getCollectorHistory(
      {
        id: collector.id,
        username: collector.username,
        role: collector.role,
      },
      limit
    );

    return NextResponse.json({
      data: {
        collector: {
          id: collector.id,
          username: collector.username,
          fullName: collector.full_name,
          role: collector.role,
        },
        items: history,
        total: history.length,
      },
      error: null,
      meta: { timestamp: new Date().toISOString() },
    });
  } catch (error: any) {
    if (error instanceof FcServiceError) {
      return NextResponse.json(
        { data: null, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }
    console.error("Collector history error:", error);
    return NextResponse.json(
      { data: null, error: { code: "INTERNAL_SERVER_ERROR", message: error?.message || "Failed to fetch history" } },
      { status: 500 }
    );
  }
}
