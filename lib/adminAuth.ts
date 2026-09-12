import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const COOKIE_NAME = "sr_admin_session";
const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

function getAdminSecret(): string {
  const secret = process.env.ADMIN_JWT_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error(
      "SECURITY ERROR: ADMIN_JWT_SECRET or ADMIN_PASSWORD must be set in your .env file."
    );
  }
  return secret;
}

export function generateAdminToken(username: string): string {
  const timestamp = Date.now().toString();
  const secret = getAdminSecret();
  const data = `${username}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("hex");

  return `${username}:${timestamp}:${signature}`;
}

export function verifyAdminToken(token: string | null | undefined): boolean {
  if (!token) return false;

  try {
    const parts = token.split(":");
    if (parts.length !== 3) return false;

    const [username, timestampStr, signature] = parts;
    const expectedUsername = process.env.ADMIN_USERNAME;
    if (!expectedUsername || username !== expectedUsername) return false;

    const timestamp = parseInt(timestampStr, 10);
    if (isNaN(timestamp)) return false;

    // Check expiry
    if (Date.now() - timestamp > SESSION_DURATION) return false;

    const secret = getAdminSecret();
    const data = `${username}:${timestampStr}`;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(data)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(req?: NextRequest): Promise<boolean> {
  let token: string | undefined;

  if (req) {
    token = req.cookies.get(COOKIE_NAME)?.value;
  } else {
    const cookieStore = cookies();
    token = cookieStore.get(COOKIE_NAME)?.value;
  }

  return verifyAdminToken(token);
}

export { COOKIE_NAME };
