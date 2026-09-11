import { randomBytes, randomInt, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { prisma } from "@/lib/prisma";
import {
  RegisterUserInput,
  SignInInput,
  VerifyEmailOtpInput,
  ResetPasswordInput,
} from "./auth.validator";
import { sendPasswordResetOtpEmail, sendVerificationOtpEmail } from "@/modules/email/email.service";

const scrypt = promisify(scryptCallback);
const OTP_EXPIRY_MINUTES = 10;
const SESSION_EXPIRY_DAYS = 30;

export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode = 400,
    public readonly code = "INVALID_INPUT"
  ) {
    super(message);
  }
}

export const hashSecret = async (secret: string): Promise<string> => {
  const salt = randomBytes(16).toString("hex");
  const key = (await scrypt(secret, salt, 64)) as Buffer;

  return `scrypt$${salt}$${key.toString("hex")}`;
};

export const verifySecretHash = async (secret: string, storedHash: string): Promise<boolean> => {
  const [algorithm, salt, keyHex] = storedHash.split("$");

  if (algorithm !== "scrypt" || !salt || !keyHex) {
    return false;
  }

  const storedKey = Buffer.from(keyHex, "hex");
  const suppliedKey = (await scrypt(secret, salt, storedKey.length)) as Buffer;

  return timingSafeEqual(storedKey, suppliedKey);
};

const createOtp = (): string => randomInt(100000, 1000000).toString();

const createSessionToken = (userId: number): string =>
  `${userId}.${randomBytes(32).toString("hex")}`;

const generateUniqueUsername = async (email: string, fullName?: string | null): Promise<string> => {
  const base = (fullName || email.split("@")[0])
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
  const cleanBase = base.length >= 3 ? base.slice(0, 15) : "user";
  let candidate = `${cleanBase}${randomInt(100, 999)}`;

  let exists = await prisma.user.findUnique({ where: { username: candidate } });
  while (exists) {
    candidate = `${cleanBase}${randomInt(1000, 99999)}`;
    exists = await prisma.user.findUnique({ where: { username: candidate } });
  }
  return candidate;
};

export const registerUser = async (input: RegisterUserInput) => {
  const fullName = input.fullName.trim();
  const email = input.email.toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AuthServiceError("An account with this email already exists", 409, "CONFLICT");
  }

  const username = await generateUniqueUsername(email, fullName);
  const otp = createOtp();
  const otpHash = await hashSecret(otp);
  const passwordHash = await hashSecret(input.password);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email,
        username,
        full_name: fullName,
        password: passwordHash,
        email_verified: false,
        status: "ACTIVE",
        role: "USER",
      },
      select: {
        id: true,
        full_name: true,
        email: true,
        username: true,
        email_verified: true,
        role: true,
      },
    });

    await tx.emailVerificationOtp.create({
      data: {
        fk_user_id: createdUser.id,
        otp_hash: otpHash,
        expires_at: expiresAt,
      },
    });

    return createdUser;
  });

  await sendVerificationOtpEmail({
    to: user.email,
    fullName: user.full_name ?? "User",
    otp,
  });

  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      email: user.email,
      username: user.username,
      emailVerified: false,
      role: user.role,
    },
    verification: {
      expiresAt,
    },
  };
};

export const signInUser = async (
  { email: emailInput, password }: SignInInput,
  context: {
    userAgent?: string;
    ip?: string;
  } = {}
) => {
  const email = emailInput.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      full_name: true,
      username: true,
      email: true,
      password: true,
      email_verified: true,
      image: true,
      role: true,
      status: true,
      is_deleted: true,
    },
  });

  if (!user || user.is_deleted || !user.password) {
    throw new AuthServiceError("Invalid email or password", 401, "UNAUTHORIZED");
  }

  if (user.status === "BANNED" || user.status === "SUSPENDED") {
    throw new AuthServiceError("Your account has been suspended", 403, "ACCOUNT_SUSPENDED");
  }

  const isValidPassword = await verifySecretHash(password, user.password);
  if (!isValidPassword) {
    throw new AuthServiceError("Invalid email or password", 401, "UNAUTHORIZED");
  }

  if (!user.email_verified) {
    throw new AuthServiceError("Please verify your email before signing in", 403, "EMAIL_UNVERIFIED");
  }

  const token = createSessionToken(user.id);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.userSession.create({
    data: {
      fk_user_id: user.id,
      session_token: token,
      expires_at: expiresAt,
      user_agent: context.userAgent ?? "unknown",
      ip_address: context.ip,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { last_login: new Date() },
  });

  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      email: user.email,
      emailVerified: true,
      role: user.role,
      image: user.image ?? undefined,
    },
    token,
  };
};

export const verifyEmailOtp = async (
  { email: emailInput, otp }: VerifyEmailOtpInput,
  context: {
    userAgent?: string;
    ip?: string;
  } = {}
) => {
  const email = emailInput.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      full_name: true,
      username: true,
      email: true,
      email_verified: true,
      image: true,
      role: true,
    },
  });

  if (!user) {
    throw new AuthServiceError("No account found for this email", 404, "RESOURCE_NOT_FOUND");
  }

  const validOtpRecord = await prisma.emailVerificationOtp.findFirst({
    where: {
      fk_user_id: user.id,
      consumed_at: null,
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: "desc" },
  });

  if (!validOtpRecord) {
    throw new AuthServiceError("Verification code has expired or is invalid. Please request a new one.", 400, "EXPIRED_OTP");
  }

  const isMatch = await verifySecretHash(otp, validOtpRecord.otp_hash);
  if (!isMatch) {
    await prisma.emailVerificationOtp.update({
      where: { id: validOtpRecord.id },
      data: { attempts: { increment: 1 } },
    });
    throw new AuthServiceError("Invalid verification code", 400, "INVALID_OTP");
  }

  // Consume OTP and mark verified
  await prisma.$transaction([
    prisma.emailVerificationOtp.update({
      where: { id: validOtpRecord.id },
      data: { consumed_at: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        email_verified: true,
        last_login: new Date(),
      },
    }),
  ]);

  const token = createSessionToken(user.id);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.userSession.create({
    data: {
      fk_user_id: user.id,
      session_token: token,
      expires_at: expiresAt,
      user_agent: context.userAgent ?? "unknown",
      ip_address: context.ip,
    },
  });

  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      email: user.email,
      emailVerified: true,
      role: user.role,
      image: user.image ?? undefined,
    },
    token,
  };
};

export const resendVerificationOtp = async (emailInput: string) => {
  const email = emailInput.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      full_name: true,
      email: true,
      email_verified: true,
    },
  });

  if (!user) {
    throw new AuthServiceError("No account found for this email", 404, "RESOURCE_NOT_FOUND");
  }

  if (user.email_verified) {
    throw new AuthServiceError("Your email is already verified. Please sign in.", 400, "ALREADY_VERIFIED");
  }

  // Invalidate previous unconsumed OTPs
  await prisma.emailVerificationOtp.updateMany({
    where: {
      fk_user_id: user.id,
      consumed_at: null,
    },
    data: {
      consumed_at: new Date(),
    },
  });

  const otp = createOtp();
  const otpHash = await hashSecret(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.emailVerificationOtp.create({
    data: {
      fk_user_id: user.id,
      otp_hash: otpHash,
      expires_at: expiresAt,
    },
  });

  await sendVerificationOtpEmail({
    to: user.email,
    fullName: user.full_name ?? "User",
    otp,
  });

  return {
    verification: {
      expiresAt,
    },
  };
};

export const signInOAuthUser = async (
  profile: {
    sub: string;
    email: string;
    name: string;
    picture?: string;
  },
  provider: "GOOGLE",
  context: {
    userAgent?: string;
    ip?: string;
  } = {}
) => {
  const email = profile.email.toLowerCase();

  return await prisma.$transaction(async (tx) => {
    let oauthAccount = await tx.userOAuthAccount.findUnique({
      where: {
        provider_provider_user_id: {
          provider,
          provider_user_id: profile.sub,
        },
      },
      include: {
        user: true,
      },
    });

    let user = oauthAccount?.user || null;

    if (!user) {
      user = await tx.user.findUnique({
        where: { email },
      });

      if (!user) {
        const base = (profile.name || email.split("@")[0])
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");
        const cleanBase = base.length >= 3 ? base.slice(0, 15) : "user";
        let usernameCandidate = `${cleanBase}${randomInt(100, 999)}`;

        let existingUsername = await tx.user.findUnique({ where: { username: usernameCandidate } });
        while (existingUsername) {
          usernameCandidate = `${cleanBase}${randomInt(1000, 99999)}`;
          existingUsername = await tx.user.findUnique({ where: { username: usernameCandidate } });
        }

        user = await tx.user.create({
          data: {
            email,
            username: usernameCandidate,
            full_name: profile.name,
            email_verified: true,
            image: profile.picture,
            status: "ACTIVE",
            role: "USER",
          },
        });
      } else {
        // If user already existed with password, ensure email_verified is true and image updated if missing
        user = await tx.user.update({
          where: { id: user.id },
          data: {
            email_verified: true,
            image: user.image ?? profile.picture,
          },
        });
      }

      oauthAccount = await tx.userOAuthAccount.create({
        data: {
          fk_user_id: user.id,
          provider,
          provider_user_id: profile.sub,
          email: profile.email,
        },
        include: {
          user: true,
        },
      });
    }

    const token = createSessionToken(user.id);
    const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

    await tx.userSession.create({
      data: {
        fk_user_id: user.id,
        session_token: token,
        expires_at: expiresAt,
        user_agent: context.userAgent ?? "unknown",
        ip_address: context.ip,
      },
    });

    await tx.user.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });

    return {
      user: {
        id: user.id,
        fullName: user.full_name,
        username: user.username,
        email: user.email,
        emailVerified: !!user.email_verified,
        role: user.role,
        image: user.image ?? profile.picture,
      },
      token,
    };
  });
};

export const getSessionUser = async (authorizationHeader: string | null) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authorizationHeader.substring(7).trim();
  if (!token) {
    return null;
  }

  const session = await prisma.userSession.findUnique({
    where: { session_token: token },
    include: {
      user: {
        select: {
          id: true,
          full_name: true,
          username: true,
          email: true,
          email_verified: true,
          image: true,
          role: true,
          status: true,
          is_deleted: true,
        },
      },
    },
  });

  if (!session || session.expires_at < new Date() || !session.user || session.user.is_deleted) {
    return null;
  }

  if (session.user.status === "BANNED" || session.user.status === "SUSPENDED") {
    return null;
  }

  return session.user;
};

export const logoutSession = async (authorizationHeader: string | null) => {
  if (!authorizationHeader || !authorizationHeader.startsWith("Bearer ")) {
    return;
  }
  const token = authorizationHeader.substring(7).trim();
  if (!token) {
    return;
  }

  try {
    await prisma.userSession.delete({
      where: { session_token: token },
    });
  } catch (e) {
    // Session might already be deleted
  }
};

export const requestPasswordReset = async (emailInput: string) => {
  const email = emailInput.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      full_name: true,
      email: true,
    },
  });

  if (!user) {
    // Return early to prevent enumeration
    return {
      verification: {
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000),
      },
    };
  }

  await prisma.emailVerificationOtp.updateMany({
    where: {
      fk_user_id: user.id,
      consumed_at: null,
    },
    data: {
      consumed_at: new Date(),
    },
  });

  const otp = createOtp();
  const otpHash = await hashSecret(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  await prisma.emailVerificationOtp.create({
    data: {
      fk_user_id: user.id,
      otp_hash: otpHash,
      expires_at: expiresAt,
    },
  });

  await sendPasswordResetOtpEmail({
    to: user.email,
    fullName: user.full_name ?? "User",
    otp,
  });

  return {
    verification: {
      expiresAt,
    },
  };
};

export const verifyResetOtp = async ({ email: emailInput, otp }: VerifyEmailOtpInput) => {
  const email = emailInput.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (!user) {
    throw new AuthServiceError("Invalid verification code", 400, "INVALID_OTP");
  }

  const validOtpRecord = await prisma.emailVerificationOtp.findFirst({
    where: {
      fk_user_id: user.id,
      consumed_at: null,
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: "desc" },
  });

  if (!validOtpRecord) {
    throw new AuthServiceError("Verification code has expired. Please request a new one.", 400, "EXPIRED_OTP");
  }

  const isMatch = await verifySecretHash(otp, validOtpRecord.otp_hash);
  if (!isMatch) {
    throw new AuthServiceError("Invalid verification code", 400, "INVALID_OTP");
  }

  return { verified: true };
};

export const resetPassword = async (
  input: ResetPasswordInput,
  context: { userAgent?: string; ip?: string } = {}
) => {
  const email = input.email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      full_name: true,
      username: true,
      email: true,
      role: true,
    },
  });

  if (!user) {
    throw new AuthServiceError("Invalid request", 400, "INVALID_INPUT");
  }

  const validOtpRecord = await prisma.emailVerificationOtp.findFirst({
    where: {
      fk_user_id: user.id,
      consumed_at: null,
      expires_at: { gt: new Date() },
    },
    orderBy: { created_at: "desc" },
  });

  if (!validOtpRecord) {
    throw new AuthServiceError("Verification code has expired. Please request a new one.", 400, "EXPIRED_OTP");
  }

  const isMatch = await verifySecretHash(input.otp, validOtpRecord.otp_hash);
  if (!isMatch) {
    throw new AuthServiceError("Invalid verification code", 400, "INVALID_OTP");
  }

  const newPasswordHash = await hashSecret(input.newPassword);

  await prisma.$transaction([
    prisma.emailVerificationOtp.update({
      where: { id: validOtpRecord.id },
      data: { consumed_at: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: {
        password: newPasswordHash,
        email_verified: true,
        last_login: new Date(),
      },
    }),
  ]);

  const token = createSessionToken(user.id);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000);

  await prisma.userSession.create({
    data: {
      fk_user_id: user.id,
      session_token: token,
      expires_at: expiresAt,
      user_agent: context.userAgent ?? "unknown",
      ip_address: context.ip,
    },
  });

  return {
    user: {
      id: user.id,
      fullName: user.full_name,
      username: user.username,
      email: user.email,
      emailVerified: true,
      role: user.role,
    },
    token,
  };
};
