import { NextRequest, NextResponse } from "next/server";
import { verifyCollectorToken, processSromojibiSync, FcServiceError } from "@/modules/fc/fc.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim() || "";
    const collector = await verifyCollectorToken(token);

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;
    const userAgent = req.headers.get("user-agent") || null;

    const body = await req.json();
    const result = await processSromojibiSync(
      {
        id: collector.id,
        username: collector.username,
        ip: ip || undefined,
        userAgent: userAgent || undefined,
      },
      body
    );

    return NextResponse.json({
      data: result,
      error: null,
      meta: { message: "Sync processed successfully" },
    });
  } catch (error: any) {
    if (error instanceof FcServiceError) {
      return NextResponse.json(
        { data: null, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }
    console.error("Sromojibi sync error:", error);
    return NextResponse.json(
      { data: null, error: { code: "INTERNAL_SERVER_ERROR", message: error?.message || "Failed to process sync" } },
      { status: 500 }
    );
  }
}
