import { Suspense } from "react";
import type { Metadata } from "next";
import SignInForm from "./_components/SignInForm";

export const metadata: Metadata = {
  title: "Sign In | Sromojibi",
  description: "Sign in to your Sromojibi account to hire skilled workers or manage your profile.",
};

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}
