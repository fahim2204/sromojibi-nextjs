import { NextRequest, NextResponse } from "next/server";
import { AuthServiceError, resendVerificationOtp } from "@/modules/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email address is required",
          },
        },
        { status: 400 }
      );
    }

    const result = await resendVerificationOtp(email);

    return NextResponse.json(
      {
        data: result,
        error: null,
        meta: {
          message: "Verification code resent successfully",
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

    console.error("Resend OTP error:", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred while resending verification code",
        },
      },
      { status: 500 }
    );
  }
}
