"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  useEffect(() => {
    const token = searchParams.get("token");
    const id = searchParams.get("id");
    const fullName = searchParams.get("fullName");
    const username = searchParams.get("username");
    const email = searchParams.get("email");
    const emailVerified = searchParams.get("emailVerified");
    const image = searchParams.get("image");
    const role = searchParams.get("role") as "USER" | "WORKER" | "ADMIN" | undefined;

    if (token && id && email) {
      localStorage.setItem("@sromojibi_token", token);

      setUser({
        id: Number(id) || id,
        fullName: fullName || "",
        username: username || "",
        email,
        emailVerified: emailVerified === "true",
        role: role || "USER",
        token,
        image: image || undefined,
      });

      const redirect = searchParams.get("redirect");
      const targetUrl = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : "/";
      router.push(targetUrl);
    } else {
      router.push("/sign-in?error=Invalid%20session%20data%20received%20from%20Google");
    }
  }, [searchParams, setUser, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
      <p className="text-xs font-semibold text-gray-600">Completing sign in...</p>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <div className="flex min-h-[calc(100vh-140px)] items-center justify-center bg-slate-50">
      <Suspense
        fallback={
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
            <p className="text-xs font-medium text-gray-500">Loading...</p>
          </div>
        }
      >
        <AuthCallbackContent />
      </Suspense>
    </div>
  );
}
