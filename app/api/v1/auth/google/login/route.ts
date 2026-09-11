import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { error: "Google client ID is not configured on the server. Please add GOOGLE_CLIENT_ID in .env" },
      { status: 500 }
    );
  }

  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
  const proto = request.headers.get("x-forwarded-proto") || (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
  const origin = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || `${proto}://${host}`;
  const redirectUri = `${origin}/api/v1/auth/google/callback`;
  const state = Math.random().toString(36).substring(2, 15);

  const googleAuthUrl =
    "https://accounts.google.com/o/oauth2/v2/auth?" +
    new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "openid email profile",
      state: state,
      prompt: "select_account",
    }).toString();

  const response = NextResponse.redirect(googleAuthUrl, 307);

  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 3600,
  });

  const redirectParam = new URL(request.url).searchParams.get("redirect");
  if (redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//")) {
    response.cookies.set("oauth_redirect", redirectParam, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 3600,
    });
  }

  return response;
}
