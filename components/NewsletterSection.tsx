"use client";

import React, { useState } from "react";
import { Mail, Bell, CheckCircle2, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@nextui-org/react";

export default function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      setStatusMsg({
        text: "Please enter a valid email address.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/v1/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMsg({
          text: data.message,
          type: data.alreadySubscribed ? "info" : "success",
        });
        if (!data.alreadySubscribed) {
          setEmail("");
        }
      } else {
        setStatusMsg({
          text: data.error || "Something went wrong. Please try again.",
          type: "error",
        });
      }
    } catch (err) {
      console.error("Newsletter submission error:", err);
      setStatusMsg({
        text: "Network connection error. Please try again.",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="notify-section" className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-slate-900 border-y border-slate-800">
      {/* Background Decorative Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 right-10 w-72 h-72 bg-teal-500/10 blur-[90px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="p-8 sm:p-12 rounded-3xl bg-slate-800/80 backdrop-blur-xl border border-slate-700/80 shadow-2xl space-y-8">
          
          {/* Header */}
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Bell className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>লঞ্চ আপডেট পেয়ে থাকুন • Stay Updated</span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Stay Updated on Sromojibi Launch
            </h2>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              নতুন মিস্ত্রি ও কারিগর যুক্ত হলেই সবার আগে আপডেট পেতে আপনার ইমেইল দিয়ে সাবস্ক্রাইব করুন।
            </p>
          </div>

          {/* Clean Single-Input Subscription Form */}
          <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Email Input */}
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address (যেমন: user@example.com)..."
                  className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                isDisabled={isLoading}
                className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer h-auto"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                    Subscribing...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" />
                    Notify Me
                  </span>
                )}
              </Button>
            </div>

            {/* Status Message Feedback */}
            {statusMsg && (
              <div
                className={`p-4 rounded-2xl border text-xs font-semibold flex items-center gap-2.5 transition-all ${
                  statusMsg.type === "success"
                    ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                    : statusMsg.type === "info"
                    ? "bg-blue-950/60 border-blue-500/50 text-blue-300"
                    : "bg-rose-950/60 border-rose-500/50 text-rose-300"
                }`}
              >
                {statusMsg.type === "success" || statusMsg.type === "info" ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                )}
                <span>{statusMsg.text}</span>
              </div>
            )}
          </form>

          {/* Social Trust Footer */}
          <div className="pt-4 border-t border-slate-700/60 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> No Spam Guarantee
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> 100% Free Alerts
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Unsubscribe Anytime
            </span>
          </div>

        </div>
      </div>
    </section>
  );
}
