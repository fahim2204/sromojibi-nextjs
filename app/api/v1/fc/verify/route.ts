import { NextRequest, NextResponse } from "next/server";
import { verifyCollectorToken, verifyCollectionRecord, FcServiceError } from "@/modules/fc/fc.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim() || "";
    const collector = await verifyCollectorToken(token);

    const body = await req.json().catch(() => ({}));
    const { collectionUuid, isVerified, reviewStatus, notes, rawPayload } = body;

    if (!collectionUuid) {
      return NextResponse.json(
        { data: null, error: { code: "BAD_REQUEST", message: "Missing collectionUuid" } },
        { status: 400 }
      );
    }

    const result = await verifyCollectionRecord({
      collectionUuid,
      isVerified: isVerified !== undefined ? Boolean(isVerified) : undefined,
      reviewStatus,
      reviewerUsername: collector.username,
      notes,
      rawPayload,
    });

    return NextResponse.json({
      data: result,
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
    console.error("Verification error:", error);
    return NextResponse.json(
      { data: null, error: { code: "INTERNAL_SERVER_ERROR", message: error?.message || "Failed to update verification" } },
      { status: 500 }
    );
  }
}
