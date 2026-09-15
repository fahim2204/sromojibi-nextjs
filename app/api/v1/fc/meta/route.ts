import { NextRequest, NextResponse } from "next/server";
import { getCollectorMeta, verifyCollectorToken, FcServiceError } from "@/modules/fc/fc.service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim() || "";
    if (token) {
      try {
        await verifyCollectorToken(token);
      } catch (_) {
        // Allow reading taxonomy even if token verification fails/expires
      }
    }

    const meta = await getCollectorMeta();

    return NextResponse.json({
      data: meta,
      error: null,
    });
  } catch (error: any) {
    if (error instanceof FcServiceError) {
      return NextResponse.json(
        { data: null, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }
    return NextResponse.json(
      { data: null, error: { code: "INTERNAL_SERVER_ERROR", message: "Failed to fetch metadata" } },
      { status: 500 }
    );
  }
}
