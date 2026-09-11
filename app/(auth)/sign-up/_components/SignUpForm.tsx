"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User as UserIcon, Eye, EyeOff, Check, AlertCircle } from "lucide-react";
import { registerUser } from "@/services/authService";
import { registerUserSchema, type RegisterUserInput } from "@/modules/auth/auth.validator";
import AuthPageShell from "../../_components/AuthPageShell";
import GoogleAuthButton from "../../_components/GoogleAuthButton";

export default function SignUpForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  const redirectParam = searchParams?.get("redirect");
  const targetRedirect = redirectParam && redirectParam.startsWith("/") && !redirectParam.startsWith("//") ? redirectParam : undefined;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterUserInput>({
    resolver: zodResolver(registerUserSchema),
    mode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      terms: false,
    },
  });

  const passwordValue = useWatch({ control, name: "password" }) ?? "";

  const hasMinLength = passwordValue.length >= 6;
  const hasUpperCase = /[A-Z]/.test(passwordValue);
  const hasNumber = /\d/.test(passwordValue);

  const onSubmit = async (data: RegisterUserInput) => {
    setSubmitError("");

    try {
      const response = await registerUser(data);

      if (typeof window !== "undefined") {
        sessionStorage.setItem("email-verification-email", response.data.user.email);
      }

      router.push(targetRedirect ? `/verify-email?redirect=${encodeURIComponent(targetRedirect)}` : "/verify-email");
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to register account");
    }
  };

  return (
    <AuthPageShell
      title="Create your account"
      subtitle="Join Sromojibi to discover trusted workers or offer your skilled services"
      footer={
        <>
          Already have an account?{" "}
          <Link
            href={targetRedirect ? `/sign-in?redirect=${encodeURIComponent(targetRedirect)}` : "/sign-in"}
            className="font-semibold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="space-y-4">
        {/* Social Sign-Up */}
        <GoogleAuthButton label="Sign up with Google" redirect={targetRedirect} />

        <div className="relative flex items-center justify-center my-3">
          <div className="border-t border-gray-200 w-full" />
          <span className="bg-white px-2.5 text-[11px] uppercase tracking-wider text-gray-400 font-semibold absolute">
            or sign up with email
          </span>
        </div>

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <p className="font-medium">{submitError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <UserIcon className="h-4 w-4" />
              </div>
              <input
                type="text"
                placeholder="Rahim Ahmed"
                {...register("fullName")}
                className={`w-full pl-9 pr-3.5 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                  errors.fullName ? "border-red-400 bg-red-50/30" : "border-gray-200"
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">
                {errors.fullName.message}
              </p>
            )}
          </div>

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
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Password
            </label>
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

            {/* Password checklist */}
            <div className="mt-2 grid grid-cols-3 gap-1.5 text-[11px] text-gray-500">
              <div className={`flex items-center gap-1 ${hasMinLength ? "text-emerald-700 font-medium" : ""}`}>
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasMinLength ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>6+ chars</span>
              </div>
              <div className={`flex items-center gap-1 ${hasUpperCase ? "text-emerald-700 font-medium" : ""}`}>
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasUpperCase ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Uppercase</span>
              </div>
              <div className={`flex items-center gap-1 ${hasNumber ? "text-emerald-700 font-medium" : ""}`}>
                <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${hasNumber ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                  <Check className="w-2.5 h-2.5" />
                </div>
                <span>Number</span>
              </div>
            </div>

            {errors.password && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("confirmPassword")}
                className={`w-full pl-9 pr-10 py-2.5 bg-gray-50/50 hover:bg-white focus:bg-white border rounded-xl text-xs sm:text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 ${
                  errors.confirmPassword ? "border-red-400 bg-red-50/30" : "border-gray-200"
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
            {errors.confirmPassword && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <div className="pt-1">
            <label className="flex items-start gap-2 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                {...register("terms")}
                className="mt-0.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <span>
                I agree to the{" "}
                <Link href="/terms" target="_blank" className="text-emerald-700 hover:underline font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" target="_blank" className="text-emerald-700 hover:underline font-medium">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.terms && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">
                {errors.terms.message}
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
                <span>Creating account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>
      </div>
    </AuthPageShell>
  );
}
