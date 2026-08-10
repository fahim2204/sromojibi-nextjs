"use client";

import React, { useState } from "react";

export default function NotifyForm() {
  const [notifyEmail, setNotifyEmail] = useState("");
  const [notifySuccess, setNotifySuccess] = useState(false);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyEmail.trim()) {
      setNotifySuccess(true);
      setTimeout(() => setNotifySuccess(false), 5000);
      setNotifyEmail("");
    }
  };

  return (
    <div className="space-y-3">
      <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
        <input
          type="email"
          required
          value={notifyEmail}
          onChange={(e) => setNotifyEmail(e.target.value)}
          placeholder="Enter your email address..."
          className="flex-1 px-4 py-3 rounded-xl bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm shadow-sm"
        />
        <button
          type="submit"
          className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all shrink-0 cursor-pointer"
        >
          Notify Me
        </button>
      </form>
      {notifySuccess && (
        <p className="text-emerald-700 text-xs font-semibold animate-fade-in">
          ✓ Thank you! We will notify you as soon as directory listings launch in your area.
        </p>
      )}
    </div>
  );
}
