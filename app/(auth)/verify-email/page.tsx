import { Suspense } from "react";
import type { Metadata } from "next";
import VerifyEmailForm from "./_components/VerifyEmailForm";

export const metadata: Metadata = {
  title: "Verify Email | Sromojibi",
  description: "Verify your email address to complete your registration on Sromojibi.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-140px)] flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
