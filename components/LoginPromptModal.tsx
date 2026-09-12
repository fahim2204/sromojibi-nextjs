"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Lock, X, ArrowRight, UserPlus, Phone } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
};

export default function LoginPromptModal({
  isOpen,
  onClose,
  title = "যোগাযোগ করতে লগইন করুন",
  message = "মিস্ত্রির সরাসরি ফোন নম্বর দেখতে এবং কাজের প্রয়োজনে যোগাযোগ করতে অনুগ্রহ করে আপনার অ্যাকাউন্টে লগইন করুন। শ্রমজীবী প্ল্যাটফর্মে সাইন-ইন সম্পূর্ণ ফ্রি!",
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 top-0 left-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-prompt-title"
    >
      <div
        className="relative w-full max-w-md p-6 sm:p-7 rounded-2xl bg-white border border-slate-200 shadow-2xl space-y-5 animate-in zoom-in-95 duration-150 my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
            <Lock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3
              id="login-prompt-title"
              className="text-lg font-bold text-slate-900 leading-tight"
            >
              {title}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              লগইন করলেই মিস্ত্রির ফোন নম্বর দৃশ্যমান হবে
            </p>
          </div>
        </div>

        {/* Informative Body */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed space-y-2">
          <p>{message}</p>
          <div className="flex items-center gap-2 text-emerald-700 font-semibold pt-1 border-t border-slate-200/60">
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>সরাসরি কথা বলে রেট ও কাজের সময় নির্ধারণ করুন</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-1">
          <Link
            href="/sign-in"
            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs"
          >
            <span>লগইন করুন (Sign In)</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/sign-up"
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <UserPlus className="w-4 h-4 text-slate-500" />
            <span>নতুন অ্যাকাউন্ট তৈরি করুন (Register)</span>
          </Link>
        </div>
      </div>
    </div>,
    document.body
  );
}
