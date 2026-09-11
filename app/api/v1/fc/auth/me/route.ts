import { NextRequest, NextResponse } from "next/server";
import { verifyCollectorToken, FcServiceError } from "@/modules/fc/fc.service";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim() || "";

    const user = await verifyCollectorToken(token);

    return NextResponse.json({
      data: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role,
        phone: user.phone,
      },
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
      { data: null, error: { code: "UNAUTHORIZED", message: "Unauthorized" } },
      { status: 401 }
    );
  }
}
