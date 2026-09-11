import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/modules/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const user = await getSessionUser(authHeader);

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        data: {
          user: {
            id: user.id,
            fullName: user.full_name,
            username: user.username,
            email: user.email,
            emailVerified: !!user.email_verified,
            image: user.image,
            role: user.role,
          },
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get current user error:", error);
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
