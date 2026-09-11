import { NextRequest, NextResponse } from "next/server";
import { loginCollector, FcServiceError } from "@/modules/fc/fc.service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { data: null, error: { code: "VALIDATION_ERROR", message: "Username and password are required" } },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get("user-agent") ?? undefined;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

    const result = await loginCollector({
      username: String(username),
      password: String(password),
      userAgent,
      ip,
    });

    return NextResponse.json({
      data: result,
      error: null,
      meta: { message: "Collector signed in successfully" },
    });
  } catch (error: any) {
    if (error instanceof FcServiceError) {
      return NextResponse.json(
        { data: null, error: { code: error.code, message: error.message } },
        { status: error.statusCode }
      );
    }

    console.error("Collector login error:", error);
    return NextResponse.json(
      { data: null, error: { code: "INTERNAL_SERVER_ERROR", message: error?.message || "Internal server error" } },
      { status: 500 }
    );
  }
}
