import { NextRequest, NextResponse } from "next/server";
import { AuthServiceError, resetPassword, resetPasswordSchema } from "@/modules/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = resetPasswordSchema.parse(body);

    const userAgent = req.headers.get("user-agent") ?? undefined;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined;

    const result = await resetPassword(validatedInput, { userAgent, ip });

    return NextResponse.json(
      {
        data: result,
        error: null,
        meta: {
          message: "Password reset successfully",
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof AuthServiceError) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.statusCode }
      );
    }

    if (error && typeof error === "object" && "issues" in error) {
      const zodError = error as { issues: Array<{ message: string }> };
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: zodError.issues[0]?.message ?? "Invalid form input",
          },
        },
        { status: 400 }
      );
    }

    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred during password reset",
        },
      },
      { status: 500 }
    );
  }
}
