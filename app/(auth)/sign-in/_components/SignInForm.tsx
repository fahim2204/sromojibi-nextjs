"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { signInUser } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { signInSchema, type SignInInput } from "@/modules/auth/auth.validator";
import AuthPageShell from "../../_components/AuthPageShell";
import GoogleAuthButton from "../../_components/GoogleAuthButton";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);
  const { setUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const redirectParam = searchParams?.get("redirect");
  const targetRedirect = redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : undefined;

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const err = searchParams?.get("error");
    if (err) {
      setSubmitError(decodeURIComponent(err));
    }
  }, [searchParams]);

  const onSubmit = async (data: SignInInput) => {
    setSubmitError("");
    setIsUnverified(false);

    try {
      const response = await signInUser(data);

      if (typeof window !== "undefined") {
        localStorage.setItem("@sromojibi_token", response.data.token);
      }

      setUser({
        id: response.data.user.id,
        fullName: response.data.user.fullName ?? "",
        username: response.data.user.username,
        email: response.data.user.email,
        emailVerified: response.data.user.emailVerified,
        role: response.data.user.role,
        token: response.data.token,
        image: response.data.user.image ?? undefined,
      });

      const finalTargetRedirect = redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : "/";
      router.push(finalTargetRedirect);
    } catch (error: any) {
      if (error?.code === "EMAIL_UNVERIFIED") {
        setIsUnverified(true);
      }
      setSubmitError(error instanceof Error ? error.message : "Unable to sign in");
    }
  };

  const handleVerifyRedirect = () => {
    const email = getValues("email");
    if (email && typeof window !== "undefined") {
      sessionStorage.setItem("email-verification-email", email);
    }
    router.push(targetRedirect ? `/verify-email?redirect=${encodeURIComponent(targetRedirect)}` : "/verify-email");
  };

  return (
    <AuthPageShell
      title="Sign in to Sromojibi"
      subtitle="Connect with skilled local workers or manage your worker profile"
      footer={
        <>
          Don&apos;t have an account?{" "}
          <Link
            href={targetRedirect ? `/sign-up?redirect=${encodeURIComponent(targetRedirect)}` : "/sign-up"}
            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Create account
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {/* Social Sign-In */}
        <GoogleAuthButton label="Continue with Google" redirect={targetRedirect} />

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-2.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold absolute">
            or sign in with email
          </span>
        </div>

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium">{submitError}</p>
              {isUnverified && (
                <button
                  type="button"
                  onClick={handleVerifyRedirect}
                  className="mt-1.5 font-bold text-red-800 underline hover:text-red-900 block cursor-pointer"
                >
                  Click here to verify your email now &rarr;
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                className={`w-full pl-9 pr-3.5 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                  errors.email ? "border-red-400 bg-red-50/30" : "border-gray-200"
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-gray-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className={`w-full pl-9 pr-10 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                  errors.password ? "border-red-400 bg-red-50/30" : "border-gray-200"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>
      </div>
    </AuthPageShell>
  );
}
