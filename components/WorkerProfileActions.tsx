"use client";

import React, { useState } from "react";
import {
  Phone,
  PhoneCall,
  Share2,
  Check,
  ShieldCheck,
  Lock,
  Loader2,
  Copy,
  Eye,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import LoginPromptModal from "@/components/LoginPromptModal";

type Props = {
  workerSlug: string;
  workerId: number;
  fullName: string;
  serviceType: string;
};

export default function WorkerProfileActions({
  workerSlug,
  fullName,
  serviceType,
}: Props) {
  const { isAuthenticated } = useAuth();
  const [revealedPhone, setRevealedPhone] = useState<string | null>(null);
  const [revealedSecondaryPhone, setRevealedSecondaryPhone] = useState<string | null>(null);
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedSecondaryPhone, setCopiedSecondaryPhone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Fetch number from authenticated API and record audit log
  const handleReveal = async (autoCall: boolean = false) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (revealedPhone) {
      if (autoCall) {
        window.location.href = `tel:${revealedPhone}`;
      }
      return;
    }

    setIsRevealing(true);
    setRevealError(null);

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("@sromojibi_token")
          : null;

      const res = await fetch(`/api/v1/workers/${workerSlug}/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ channel: "PHONE" }),
      });

      const json = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setShowLoginModal(true);
          return;
        }
        setRevealError(
          json.error?.message || "নম্বর প্রদর্শন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।"
        );
        return;
      }

      const phone = json.data?.phone;
      const secondaryPhone = json.data?.secondaryPhone;
      if (phone) {
        setRevealedPhone(phone);
        if (secondaryPhone) {
          setRevealedSecondaryPhone(secondaryPhone);
        }
        if (autoCall) {
          window.location.href = `tel:${phone}`;
        }
      } else {
        setRevealError("মিস্ত্রির ফোন নম্বর পাওয়া যায়নি।");
      }
    } catch (err) {
      console.error("Reveal contact error:", err);
      setRevealError("সংযোগ ব্যর্থ হয়েছে। আপনার ইন্টারনেট চেক করে পুনরায় চেষ্টা করুন।");
    } finally {
      setIsRevealing(false);
    }
  };

  const handleCopyPhone = async () => {
    if (!revealedPhone) return;
    try {
      await navigator.clipboard.writeText(revealedPhone);
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    } catch (err) {
      console.error("Failed to copy phone:", err);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="space-y-3">
      {/* Error Notice */}
      {revealError && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-800 bg-rose-50 border border-rose-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <p>{revealError}</p>
        </div>
      )}

      {/* Action Area */}
      {!revealedPhone ? (
        /* State 1: Hidden / Unrevealed */
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Primary Reveal / Call Button */}
          <button
            type="button"
            disabled={isRevealing}
            onClick={() => handleReveal(false)}
            className="w-full sm:w-auto flex-1 px-5 py-3.5 sm:py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-500 text-white font-bold text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isRevealing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-100" />
                <span>লোড হচ্ছে...</span>
              </>
            ) : !isAuthenticated ? (
              <>
                <Lock className="w-4 h-4 text-emerald-200" />
                <span>ফোন নম্বর দেখুন / কল করুন</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 text-emerald-200" />
                <span>ফোন নম্বর দেখুন / কল করুন</span>
              </>
            )}
          </button>

          {/* Share Profile Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="w-full sm:w-auto px-4 py-3 sm:py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer active:scale-98"
            title="প্রোফাইল লিংক শেয়ার করুন"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">লিংক কপি হয়েছে!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>শেয়ার করুন</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* State 2: Revealed Number UI */
        <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-3.5">
          {/* Revealed Number Display Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  সরাসরি মোবাইল নম্বর
                </span>
                <span className="text-base sm:text-xl font-black text-slate-900 tracking-wide font-mono select-all">
                  {revealedPhone}
                </span>
              </div>
            </div>

            {/* Quick Copy Number Button */}
            <button
              type="button"
              onClick={handleCopyPhone}
              className="self-start sm:self-center px-3.5 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copiedPhone ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>নম্বর কপি</span>
                </>
              )}
            </button>
          </div>

          {/* Optional Secondary Phone Card */}
          {revealedSecondaryPhone && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 py-2.5 px-3 rounded-xl bg-white border border-slate-200/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    বিকল্প নম্বর (Secondary)
                  </span>
                  <span className="text-sm sm:text-base font-bold text-slate-800 tracking-wide font-mono select-all">
                    {revealedSecondaryPhone}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <a
                  href={`tel:${revealedSecondaryPhone}`}
                  className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold flex items-center gap-1 transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>কল</span>
                </a>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(revealedSecondaryPhone);
                      setCopiedSecondaryPhone(true);
                      setTimeout(() => setCopiedSecondaryPhone(false), 2000);
                    } catch (err) {
                      console.error("Failed to copy phone:", err);
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copiedSecondaryPhone ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">কপি</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>কপি</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Action Links */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
            {/* Direct Call Button */}
            <a
              href={`tel:${revealedPhone}`}
              className="w-full sm:w-auto flex-1 px-6 py-3.5 sm:py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm sm:text-base transition-all shadow-sm flex items-center justify-center gap-2.5 cursor-pointer active:scale-98"
            >
              <PhoneCall className="w-5 h-5 text-white animate-pulse" />
              <span>সরাসরি কল করুন ({revealedPhone})</span>
            </a>

            {/* Share Profile Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="w-full sm:w-auto px-4 py-3 sm:py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">লিংক কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>শেয়ার করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Safety & Notice Pill */}
      <div className="flex items-center gap-2 text-xs text-slate-600 bg-white border border-slate-200 px-3.5 py-2 rounded-lg font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>
          {isAuthenticated
            ? "শ্রমজীবী প্ল্যাটফর্মে সরাসরি ফোন কলে যোগাযোগ সম্পূর্ণ ফ্রি!"
            : "মিস্ত্রির সরাসরি ফোন নম্বর দেখতে ও যোগাযোগ করতে অনুগ্রহ করে লগইন করুন।"}
        </span>
      </div>

      {/* Mobile Sticky Bottom Call Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="flex items-center gap-2.5">
          {!revealedPhone ? (
            <button
              type="button"
              disabled={isRevealing}
              onClick={() => handleReveal(false)}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-500 text-white font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {isRevealing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-100" />
                  <span>লোড হচ্ছে...</span>
                </>
              ) : (
                <>
                  <PhoneCall className="w-4 h-4 text-emerald-200" />
                  <span>ফোন নম্বর দেখুন / কল করুন</span>
                </>
              )}
            </button>
          ) : (
            <a
              href={`tel:${revealedPhone}`}
              className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <PhoneCall className="w-4 h-4 text-white animate-pulse" />
              <span>সরাসরি কল করুন</span>
            </a>
          )}

          <button
            type="button"
            onClick={handleCopyLink}
            className="p-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer shrink-0"
            title="লিংক শেয়ার"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-600" />
            ) : (
              <Share2 className="w-4 h-4 text-slate-500" />
            )}
          </button>
        </div>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="মিস্ত্রির ফোন নম্বর দেখতে লগইন করুন"
        message={`${fullName} এর সাথে সরাসরি ফোনে কথা বলতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন-ইন করুন।`}
      />
    </div>
  );
}
