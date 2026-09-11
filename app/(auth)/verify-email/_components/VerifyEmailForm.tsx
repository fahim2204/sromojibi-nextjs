"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle2, AlertCircle, RotateCw } from "lucide-react";
import { verifyEmailOtp, resendVerificationOtp } from "@/services/authService";
import { useAuth } from "@/hooks/useAuth";
import { verifyEmailOtpSchema, type VerifyEmailOtpInput } from "@/modules/auth/auth.validator";
import AuthPageShell from "../../_components/AuthPageShell";

export default function VerifyEmailForm() {
  const [email, setEmail] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [resendSuccess, setResendSuccess] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);
  const { setUser } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const urlEmail = searchParams?.get("email");
    const storedEmail = typeof window !== "undefined" ? sessionStorage.getItem("email-verification-email") : null;
    const finalEmail = urlEmail || storedEmail || "";
    setEmail(finalEmail);
  }, [searchParams]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailOtpInput>({
    resolver: zodResolver(verifyEmailOtpSchema),
    defaultValues: {
      email: "",
      otp: "",
    },
  });

  useEffect(() => {
    if (email) {
      setValue("email", email);
    }
  }, [email, setValue]);

  const onSubmit = async (data: VerifyEmailOtpInput) => {
    setSubmitError("");
    setResendSuccess("");

    try {
      const response = await verifyEmailOtp(data);

      if (typeof window !== "undefined") {
        localStorage.setItem("@sromojibi_token", response.data.token);
        sessionStorage.removeItem("email-verification-email");
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

      const redirectParam = searchParams?.get("redirect");
      const targetRedirect = redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : "/";
      router.push(targetRedirect);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to verify code");
    }
  };

  const handleResend = async () => {
    if (!email || countdown > 0 || isResending) return;

    setIsResending(true);
    setSubmitError("");
    setResendSuccess("");

    try {
      await resendVerificationOtp(email);
      setResendSuccess("A new 6-digit verification code has been sent to your email.");
      setCountdown(60);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Failed to resend code");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AuthPageShell
      title="Verify your email"
      subtitle="Enter the 6-digit code sent to your email to activate your account"
      footer={
        <>
          Wrong email address?{" "}
          <Link href="/sign-up" className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline">
            Register again
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {email && (
          <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="truncate">
              Verification sent to: <strong className="font-semibold text-emerald-900">{email}</strong>
            </span>
          </div>
        )}

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="font-medium">{submitError}</p>
          </div>
        )}

        {resendSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-medium">{resendSuccess}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!email && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="name@example.com"
                {...register("email")}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border border-gray-200 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
              />
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 text-center">
              6-Digit Verification Code
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              autoComplete="one-time-code"
              {...register("otp")}
              className={`w-full py-3.5 text-center tracking-[8px] font-mono text-xl sm:text-2xl font-bold text-gray-900 bg-gray-50 hover:bg-white focus:bg-white border rounded-xl transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                errors.otp ? "border-red-400 bg-red-50/30" : "border-gray-200"
              }`}
            />
            {errors.otp && (
              <p className="mt-1.5 text-[11px] text-center text-red-600 font-medium">
                {errors.otp.message}
              </p>
            )}
            <p className="mt-2 text-center text-[11px] text-gray-400">
              Code expires in 10 minutes.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                <span>Verifying...</span>
              </>
            ) : (
              <span>Verify & Continue</span>
            )}
          </button>
        </form>

        <div className="text-center pt-2">
          <button
            type="button"
            onClick={handleResend}
            disabled={countdown > 0 || isResending || !email}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800 disabled:text-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
            {countdown > 0 ? (
              <span>Resend code in {countdown}s</span>
            ) : (
              <span>Resend verification code</span>
            )}
          </button>
        </div>
      </div>
    </AuthPageShell>
  );
}
