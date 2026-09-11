import { NextRequest, NextResponse } from "next/server";
import { AuthServiceError, verifyEmailOtpSchema, verifyResetOtp } from "@/modules/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validatedInput = verifyEmailOtpSchema.parse(body);

    const result = await verifyResetOtp(validatedInput);

    return NextResponse.json(
      {
        data: result,
        error: null,
        meta: {
          message: "Code verified successfully",
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
            message: zodError.issues[0]?.message ?? "Invalid verification code",
          },
        },
        { status: 400 }
      );
    }

    console.error("Verify reset OTP error:", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      },
      { status: 500 }
    );
  }
}
