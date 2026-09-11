import { Suspense } from "react";
import type { Metadata } from "next";
import SignUpForm from "./_components/SignUpForm";

export const metadata: Metadata = {
  title: "Create an Account | Sromojibi",
  description: "Create a Sromojibi account to find verified workers or offer your professional services.",
};

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}
