import { z, ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const registerUserSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(11, "Valid phone number required").optional(),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = registerUserSchema.parse(body);

    // Check for duplicate email or username
    const existingEmail = await prisma.user.findUnique({
      where: { email: payload.email.toLowerCase() },
    });
    if (existingEmail) {
      return apiError("CONFLICT", "An account with this email already exists", {
        status: 409,
      });
    }

    const existingUsername = await prisma.user.findUnique({
      where: { username: payload.username.toLowerCase() },
    });
    if (existingUsername) {
      return apiError("CONFLICT", "Username is already taken", { status: 409 });
    }

    const user = await prisma.user.create({
      data: {
        full_name: payload.fullName,
        email: payload.email.toLowerCase(),
        username: payload.username.toLowerCase(),
        phone: payload.phone ?? null,
        password: payload.password, // In production, hash with bcrypt/argon2
        status: "ACTIVE",
        role: "USER",
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        status: true,
        created_at: true,
      },
    });

    return apiSuccess(user, {
      status: 201,
      meta: {
        message: "Account created successfully.",
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(
        "INVALID_INPUT",
        error.issues[0]?.message ?? "Invalid registration data",
        { status: 400 }
      );
    }

    if (error instanceof SyntaxError) {
      return apiError("INVALID_INPUT", "Invalid JSON request body", { status: 400 });
    }

    console.error("POST /api/v1/auth/register error:", error);
    return apiError("INTERNAL_SERVER_ERROR", "Failed to register user", {
      status: 500,
    });
  }
}
