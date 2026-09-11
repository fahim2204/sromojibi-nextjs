"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";
import { requestPasswordReset, resetPassword } from "@/services/authService";
import {
  forgotPasswordSchema,
  resetPasswordSchema,
  type ForgotPasswordInput,
  type ResetPasswordInput,
} from "@/modules/auth/auth.validator";
import AuthPageShell from "../../_components/AuthPageShell";

export default function ForgotPasswordForm() {
  const [step, setStep] = useState<"request" | "reset">("request");
  const [targetEmail, setTargetEmail] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  // Step 1 Form
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: emailErrors, isSubmitting: isSubmittingEmail },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // Step 2 Form
  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    setValue: setResetValue,
    formState: { errors: resetErrors, isSubmitting: isSubmittingReset },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onRequestSubmit = async (data: ForgotPasswordInput) => {
    setSubmitError("");
    setSuccessMessage("");

    try {
      await requestPasswordReset(data.email);
      setTargetEmail(data.email);
      setResetValue("email", data.email);
      setSuccessMessage("If an account exists with this email, a 6-digit reset code has been sent.");
      setStep("reset");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to request password reset");
    }
  };

  const onResetSubmit = async (data: ResetPasswordInput) => {
    setSubmitError("");

    try {
      await resetPassword(data);
      setSuccessMessage("Password reset successfully! Redirecting to sign in...");
      setTimeout(() => {
        router.push("/sign-in");
      }, 1500);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to reset password");
    }
  };

  return (
    <AuthPageShell
      title={step === "request" ? "Reset your password" : "Set new password"}
      subtitle={
        step === "request"
          ? "Enter your email address and we'll send you a 6-digit code to reset your password"
          : `Enter the code sent to ${targetEmail} along with your new password`
      }
      footer={
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to sign in</span>
        </Link>
      }
    >
      <div className="space-y-4">
        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="font-medium">{submitError}</p>
          </div>
        )}

        {successMessage && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p className="font-medium">{successMessage}</p>
          </div>
        )}

        {step === "request" ? (
          <form onSubmit={handleSubmitEmail(onRequestSubmit)} className="space-y-4">
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
                  {...registerEmail("email")}
                  className={`w-full pl-9 pr-3.5 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                    emailErrors.email ? "border-red-400 bg-red-50/30" : "border-gray-200"
                  }`}
                />
              </div>
              {emailErrors.email && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {emailErrors.email.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmittingEmail}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmittingEmail ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Sending code...</span>
                </>
              ) : (
                <span>Send Reset Code</span>
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                6-Digit Reset Code
              </label>
              <input
                type="text"
                maxLength={6}
                placeholder="000000"
                {...registerReset("otp")}
                className={`w-full py-2.5 text-center tracking-[6px] font-mono text-lg font-bold text-gray-900 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                  resetErrors.otp ? "border-red-400 bg-red-50/30" : "border-gray-200"
                }`}
              />
              {resetErrors.otp && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {resetErrors.otp.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...registerReset("newPassword")}
                  className={`w-full pl-9 pr-10 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                    resetErrors.newPassword ? "border-red-400 bg-red-50/30" : "border-gray-200"
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
              {resetErrors.newPassword && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {resetErrors.newPassword.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...registerReset("confirmPassword")}
                  className={`w-full pl-9 pr-10 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                    resetErrors.confirmPassword ? "border-red-400 bg-red-50/30" : "border-gray-200"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {resetErrors.confirmPassword && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {resetErrors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmittingReset}
              className="w-full mt-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmittingReset ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  <span>Resetting password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setStep("request")}
                className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                Change email address
              </button>
            </div>
          </form>
        )}
      </div>
    </AuthPageShell>
  );
}
