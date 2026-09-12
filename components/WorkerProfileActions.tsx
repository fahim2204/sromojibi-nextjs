"use client";

import React, { useState } from "react";
import {
  Phone,
  PhoneCall,
  MessageSquare,
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
  const [isRevealing, setIsRevealing] = useState(false);
  const [revealError, setRevealError] = useState<string | null>(null);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // WhatsApp formatting helper
  const getWhatsAppLink = (phone: string) => {
    const clean = phone.replace(/\D/g, "");
    const number = clean.startsWith("88")
      ? clean
      : clean.startsWith("0")
      ? `88${clean}`
      : `880${clean}`;

    const text = encodeURIComponent(
      `আসসালামু আলাইকুম ${fullName} ভাই, আমি শ্রমজীবী (Sromojibi) প্ল্যাটফর্ম থেকে আপনার নম্বরটি পেয়েছি। আপনার ${serviceType} সার্ভিস সম্পর্কে কথা বলতে চাই।`
    );

    return `https://wa.me/${number}?text=${text}`;
  };

  // Fetch number from authenticated API and record audit log
  const handleReveal = async (
    channel: "PHONE" | "WHATSAPP",
    autoAction: boolean = false
  ) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (revealedPhone) {
      if (channel === "PHONE" && autoAction) {
        window.location.href = `tel:${revealedPhone}`;
      } else if (channel === "WHATSAPP") {
        window.open(getWhatsAppLink(revealedPhone), "_blank", "noopener,noreferrer");
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
        body: JSON.stringify({ channel }),
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
      if (phone) {
        setRevealedPhone(phone);
        if (channel === "PHONE" && autoAction) {
          window.location.href = `tel:${phone}`;
        } else if (channel === "WHATSAPP") {
          window.open(getWhatsAppLink(phone), "_blank", "noopener,noreferrer");
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
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Primary Reveal / Call Button */}
          <button
            type="button"
            disabled={isRevealing}
            onClick={() => handleReveal("PHONE", false)}
            className="flex-1 sm:flex-initial px-5 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-98"
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
                <span>ফোন নম্বর দেখুন</span>
              </>
            )}
          </button>

          {/* WhatsApp Message Button */}
          <button
            type="button"
            disabled={isRevealing}
            onClick={() => handleReveal("WHATSAPP", false)}
            className="flex-1 sm:flex-initial px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
          >
            {isAuthenticated ? (
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-slate-400" />
            )}
            <span>WhatsApp মেসেজ</span>
          </button>

          {/* Share Profile Link */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3.5 py-3 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
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
                <span>শেয়ার</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* State 2: Revealed Number UI */
        <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-3">
          {/* Revealed Number Display Card */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Phone className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                  সরাসরি মোবাইল নম্বর
                </span>
                <span className="text-base sm:text-lg font-black text-slate-900 tracking-wide font-mono">
                  {revealedPhone}
                </span>
              </div>
            </div>

            {/* Quick Copy Number Button */}
            <button
              type="button"
              onClick={handleCopyPhone}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
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

          {/* Action Links */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Direct Call Button */}
            <a
              href={`tel:${revealedPhone}`}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" />
              <span>সরাসরি কল করুন</span>
            </a>

            {/* WhatsApp Link */}
            <a
              href={getWhatsAppLink(revealedPhone)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-emerald-400" />
              <span>WhatsApp চ্যাট</span>
            </a>

            {/* Share Profile Link */}
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3 py-2.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">লিংক কপি হয়েছে</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>শেয়ার</span>
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
            ? "শ্রমজীবী প্ল্যাটফর্মে সরাসরি ফোন কলে বা WhatsApp-এ যোগাযোগ সম্পূর্ণ ফ্রি!"
            : "মিস্ত্রির সরাসরি ফোন নম্বর দেখতে ও যোগাযোগ করতে অনুগ্রহ করে লগইন করুন।"}
        </span>
      </div>

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        title="মিস্ত্রির ফোন নম্বর দেখতে লগইন করুন"
        message={`${fullName} এর সাথে সরাসরি ফোনে কথা বলতে বা WhatsApp মেসেজ পাঠাতে অনুগ্রহ করে আপনার অ্যাকাউন্টে সাইন-ইন করুন।`}
      />
    </div>
  );
}
