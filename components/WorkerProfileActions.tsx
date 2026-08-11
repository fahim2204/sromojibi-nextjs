"use client";

import React, { useState } from "react";
import { Phone, MessageSquare, Share2, Check, ShieldCheck } from "lucide-react";

type Props = {
  phone: string;
  fullName: string;
  serviceType: string;
};

export default function WorkerProfileActions({ phone, fullName, serviceType }: Props) {
  const [copied, setCopied] = useState(false);

  // Format phone number for WhatsApp wa.me link (e.g. 01711... -> 8801711...)
  const formattedPhone = phone.replace(/\D/g, "");
  const whatsappNumber = formattedPhone.startsWith("88")
    ? formattedPhone
    : formattedPhone.startsWith("0")
    ? `88${formattedPhone}`
    : `880${formattedPhone}`;

  const whatsappMessage = encodeURIComponent(
    `আসসালামু আলাইকুম ${fullName} ভাই, আমি শ্রমজীবী (Sromojibi) প্ল্যাটফর্ম থেকে আপনার নম্বরটি পেয়েছি। আপনার ${serviceType} সার্ভিস সম্পর্কে কথা বলতে চাই।`
  );

  const handleCopyLink = async () => {
    try {
      if (typeof window !== "undefined") {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch (err) {
      console.error("Failed to copy link:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Direct Phone Call Button */}
        <a
          href={`tel:${phone}`}
          className="flex-1 sm:flex-initial px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <Phone className="w-4 h-4 animate-bounce" />
          <span>সরাসরি কল করুন ({phone})</span>
        </a>

        {/* WhatsApp Message Button */}
        <a
          href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 sm:flex-initial px-6 py-3.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 font-bold text-sm transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
        >
          <MessageSquare className="w-4 h-4 text-emerald-400" />
          <span>WhatsApp মেসেজ</span>
        </a>

        {/* Share / Copy Link Button */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="px-5 py-3.5 rounded-xl bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:border-gray-400"
          title="Share Profile Link"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-700 font-bold">লিংক কপি হয়েছে!</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4 text-gray-500" />
              <span>প্রোফাইল শেয়ার</span>
            </>
          )}
        </button>
      </div>

      <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 rounded-lg font-medium">
        <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
        <span>শ্রমজীবী প্ল্যাটফর্মে সব মিস্ত্রিদের সাথে সরাসরি যোগাযোগের সার্ভিস সম্পূর্ণ ফ্রি!</span>
      </div>
    </div>
  );
}
