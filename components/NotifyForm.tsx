"use client";

import React, { useState } from "react";
import { Mail, Sparkles, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function NotifyForm() {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{
    text: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const handleNotifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim() || !notifyEmail.includes("@")) {
      setStatusMsg({ text: "Please enter a valid email address.", type: "error" });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch("/api/v1/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: notifyEmail }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMsg({
          text: data.message,
          type: data.alreadySubscribed ? "info" : "success",
        });
        if (!data.alreadySubscribed) setNotifyEmail("");
      } else {
        setStatusMsg({ text: data.error || "Failed to subscribe.", type: "error" });
      }
    } catch (err) {
      console.error("Error submitting notification form:", err);
      setStatusMsg({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Mail className="w-4 h-4" />
          </div>
          <input
            type="email"
            required
            value={notifyEmail}
            onChange={(e) => setNotifyEmail(e.target.value)}
            placeholder="Enter your email address..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm shadow-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer flex items-center justify-center gap-1.5"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Subscribing...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Notify Me</span>
            </>
          )}
        </button>
      </form>
      {statusMsg && (
        <div
          className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
            statusMsg.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : statusMsg.type === "info"
              ? "bg-blue-50 text-blue-800 border border-blue-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          {statusMsg.type === "success" || statusMsg.type === "info" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{statusMsg.text}</span>
        </div>
      )}
    </div>
  );
}
