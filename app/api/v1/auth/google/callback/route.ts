import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { signInOAuthUser, AuthServiceError } from "@/modules/auth";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;
  const redirectUri = `${origin}/api/v1/auth/google/callback`;

  // Get saved state cookie
  const cookieStore = cookies();
  const savedState = cookieStore.get("oauth_state")?.value;

  // Verify state matches
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(`${origin}/sign-in?error=State%20mismatch.%20Possible%20CSRF%20attack.`);
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/sign-in?error=Missing%20authorization%20code%20from%20Google.`);
  }

  try {
    // 1. Exchange authorization code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error("Google token exchange error:", errorData);
      throw new Error("Failed to exchange auth code with Google.");
    }

    const tokens = await tokenResponse.json();

    // 2. Fetch user profile info
    const profileResponse = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      throw new Error("Failed to fetch user profile from Google.");
    }

    const profile = await profileResponse.json();

    if (!profile.email) {
      throw new Error("Google account does not have a primary email address.");
    }

    // 3. Log in/Register the user
    const result = await signInOAuthUser(
      {
        sub: profile.sub,
        email: profile.email,
        name: profile.name || profile.given_name || "Google User",
        picture: profile.picture,
      },
      "GOOGLE",
      {
        userAgent: request.headers.get("user-agent") ?? undefined,
        ip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim(),
      }
    );

    // 4. Redirect user to frontend callback page to save tokens to Zustand & localStorage
    const callbackUrl = new URL(`${origin}/auth/callback`);
    callbackUrl.searchParams.set("token", result.token);
    callbackUrl.searchParams.set("id", String(result.user.id));
    callbackUrl.searchParams.set("fullName", result.user.fullName ?? "");
    callbackUrl.searchParams.set("username", result.user.username);
    callbackUrl.searchParams.set("email", result.user.email);
    callbackUrl.searchParams.set("emailVerified", String(result.user.emailVerified));
    callbackUrl.searchParams.set("role", result.user.role);
    callbackUrl.searchParams.set("image", result.user.image ?? "");

    const redirectTarget = cookieStore.get("oauth_redirect")?.value;
    if (redirectTarget && redirectTarget.startsWith("/") && !redirectTarget.startsWith("//")) {
      callbackUrl.searchParams.set("redirect", redirectTarget);
    }

    // Clear state & redirect cookies
    const response = NextResponse.redirect(callbackUrl.toString());
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_redirect");
    return response;
  } catch (error) {
    console.error("Google login callback error:", error);
    const message = error instanceof AuthServiceError || error instanceof Error ? error.message : "Unable to authenticate with Google.";
    return NextResponse.redirect(`${origin}/sign-in?error=${encodeURIComponent(message)}`);
  }
}
