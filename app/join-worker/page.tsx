"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function JoinWorkerPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    serviceType: "Electrician",
    city: "Dhaka",
    experience: "1-3 Years",
    details: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Worker Profile Registration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Are you a skilled worker?
          </h1>
          <p className="text-gray-300 text-base md:text-lg">
            Create your free profile and help customers find your services online across Bangladesh.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Benefits Box */}
          <div className="lg:col-span-1 space-y-6 bg-gray-900 border border-gray-800 rounded-3xl p-6 h-fit">
            <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-3">Why Join Sromojibi?</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-lg leading-none">✓</span>
                <div>
                  <h3 className="font-bold text-white">Free Listing</h3>
                  <p className="text-xs text-gray-400">No hidden fees or commissions during launch period.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-lg leading-none">✓</span>
                <div>
                  <h3 className="font-bold text-white">More Customer Reach</h3>
                  <p className="text-xs text-gray-400">Get calls and direct discovery from nearby households.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-lg leading-none">✓</span>
                <div>
                  <h3 className="font-bold text-white">Build Your Reputation</h3>
                  <p className="text-xs text-gray-400">Showcase your years of trade experience and specialties.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-400 font-bold text-lg leading-none">✓</span>
                <div>
                  <h3 className="font-bold text-white">Get Discovered Locally</h3>
                  <p className="text-xs text-gray-400">Appear in directory search results for your city or district.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Box */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-3xl p-6 md:p-8 space-y-6">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="text-5xl">🎉</div>
                <h2 className="text-2xl font-bold text-white">Registration Received!</h2>
                <p className="text-gray-300 text-sm max-w-md mx-auto">
                  Thank you, <strong className="text-white">{formData.fullName}</strong>. Your profile request for <strong className="text-emerald-400">{formData.serviceType}</strong> in <strong className="text-white">{formData.city}</strong> has been registered. Our team will contact you at <strong className="text-white">{formData.phone}</strong> when local listings activate.
                </p>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: "",
                        phone: "",
                        serviceType: "Electrician",
                        city: "Dhaka",
                        experience: "1-3 Years",
                        details: "",
                      });
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs transition-colors"
                  >
                    Submit Another Worker Profile
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-3">Create Free Worker Profile</h2>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Full Name / নাম *</label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="e.g. Abul Kashem Mistri"
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Mobile Phone Number / মোবাইল নম্বর *</label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 01700000000"
                      className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Service Category / কাজের ধরন *</label>
                    <select
                      value={formData.serviceType}
                      onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Rajmistri">🏠 Rajmistri (রাজমিস্ত্রি)</option>
                      <option value="Electrician">⚡ Electrician (ইলেকট্রিশিয়ান)</option>
                      <option value="Plumber">🚰 Plumber (প্ল্যাম্বার)</option>
                      <option value="Tiles Worker">🧱 Tiles Worker (টাইলস মিস্ত্রি)</option>
                      <option value="Painter">🎨 Painter (রং মিস্ত্রি)</option>
                      <option value="Carpenter">🔨 Carpenter (কাঠ মিস্ত্রি)</option>
                      <option value="AC Technician">❄️ AC Technician (এসি টেকনিশিয়ান)</option>
                      <option value="CCTV Installer">📹 CCTV Installer (সিসিটিভি মিস্ত্রি)</option>
                      <option value="Other">🛠️ Other Skilled Trades</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">City / Division *</label>
                    <select
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Dhaka">Dhaka (ঢাকা)</option>
                      <option value="Chittagong">Chittagong (চট্টগ্রাম)</option>
                      <option value="Mymensingh">Mymensingh (ময়মনসিংহ)</option>
                      <option value="Sylhet">Sylhet (সিলেট)</option>
                      <option value="Rajshahi">Rajshahi (রাজশাহী)</option>
                      <option value="Khulna">Khulna (খুলনা)</option>
                      <option value="Other District">Other District</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-gray-300">Experience Level *</label>
                    <select
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    >
                      <option value="1-3 Years">1 - 3 Years</option>
                      <option value="3-5 Years">3 - 5 Years</option>
                      <option value="5-10 Years">5 - 10 Years</option>
                      <option value="10+ Years">10+ Years Expert</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-300">Specialty / Experience Summary (Optional)</label>
                  <textarea
                    rows={3}
                    value={formData.details}
                    onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                    placeholder="Briefly describe your services (e.g., house wiring, industrial plumbing, floor tiling)..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-950 border border-gray-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-base shadow-lg shadow-emerald-500/20 transition-all"
                >
                  Register Free Worker Profile
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/" className="text-xs font-semibold text-gray-400 hover:text-emerald-400">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
