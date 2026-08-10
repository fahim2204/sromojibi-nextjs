"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input, Select, SelectItem, Textarea, Button } from "@nextui-org/react";
import { APP_API } from "@/constants/api";

export default function JoinWorkerPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "Electrician",
    city: "Dhaka",
    zilla: "",
    upazila: "",
    village: "",
    experience: "1-3 Years",
    details: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(APP_API.WORKERS.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message ?? "Registration failed. Please try again.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setErrorMsg(err.message ?? "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const serviceCategories = [
    { key: "Electrician", label: "⚡ Electrician (ইলেকট্রিশিয়ান)" },
    { key: "Rajmistri", label: "🏠 Rajmistri (রাজমিস্ত্রি)" },
    { key: "Plumber", label: "🚰 Plumber (প্ল্যাম্বার)" },
    { key: "Tiles Worker", label: "🧱 Tiles Worker (টাইলস মিস্ত্রি)" },
    { key: "Painter", label: "🎨 Painter (রং মিস্ত্রি)" },
    { key: "Carpenter", label: "🔨 Carpenter (কাঠ মিস্ত্রি)" },
    { key: "AC Technician", label: "❄️ AC Technician (এসি টেকনিশিয়ান)" },
    { key: "CCTV Installer", label: "📹 CCTV Installer (সিসিটিভি মিস্ত্রি)" },
    { key: "Other", label: "🛠️ Other Skilled Trades" },
  ];

  const cities = [
    { key: "Dhaka", label: "Dhaka (ঢাকা)" },
    { key: "Chittagong", label: "Chittagong (চট্টগ্রাম)" },
    { key: "Mymensingh", label: "Mymensingh (ময়মনসিংহ)" },
    { key: "Sylhet", label: "Sylhet (সিলেট)" },
    { key: "Rajshahi", label: "Rajshahi (রাজশাহী)" },
    { key: "Khulna", label: "Khulna (খুলনা)" },
    { key: "Other District", label: "Other District" },
  ];

  const experienceLevels = [
    { key: "1-3 Years", label: "1 - 3 Years" },
    { key: "3-5 Years", label: "3 - 5 Years" },
    { key: "5-10 Years", label: "5 - 10 Years" },
    { key: "10+ Years", label: "10+ Years Expert" },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            Worker Profile Registration
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900">
            Are you a skilled worker?
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            Create your free profile and help customers find your services online across Bangladesh.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Benefits Box */}
          <div className="lg:col-span-1 space-y-6 bg-white border border-gray-200 rounded-3xl p-6 h-fit shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 border-b border-gray-200 pb-3">Why Join Sromojibi?</h2>
            
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold text-lg leading-none">✓</span>
                <div>
                  <h3 className="font-bold text-gray-900">Free Listing</h3>
                  <p className="text-xs text-gray-500">No hidden fees or commissions during launch period.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold text-lg leading-none">✓</span>
                <div>
                  <h3 className="font-bold text-gray-900">More Customer Reach</h3>
                  <p className="text-xs text-gray-500">Get calls and direct discovery from nearby households.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold text-lg leading-none">✓</span>
                <div>
                  <h3 className="font-bold text-gray-900">Build Your Reputation</h3>
                  <p className="text-xs text-gray-500">Showcase your years of trade experience and specialties.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="text-emerald-600 font-bold text-lg leading-none">✓</span>
                <div>
                  <h3 className="font-bold text-gray-900">Get Discovered Locally</h3>
                  <p className="text-xs text-gray-500">Appear in directory search results for your city, zilla, or upazila.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Box */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
            {submitted ? (
              <div className="py-12 text-center space-y-4">
                <div className="text-5xl">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900">Registration Received!</h2>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  Thank you, <strong className="text-gray-900">{formData.fullName}</strong>. Your profile request for <strong className="text-emerald-700">{formData.serviceType}</strong> in <strong className="text-gray-900">{formData.city}</strong> has been registered. Our team will contact you at <strong className="text-gray-900">{formData.phone}</strong> when local listings activate.
                </p>
                <div className="pt-4">
                  <Button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        fullName: "",
                        email: "",
                        phone: "",
                        serviceType: "Electrician",
                        city: "Dhaka",
                        zilla: "",
                        upazila: "",
                        village: "",
                        experience: "1-3 Years",
                        details: "",
                      });
                    }}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl"
                  >
                    Submit Another Worker Profile
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 pb-6">Create Free Worker Profile</h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    isRequired
                    labelPlacement="outside"
                    type="text"
                    label="Full Name / নাম"
                    placeholder="e.g. Abul Kashem Mistri"
                    variant="bordered"
                    value={formData.fullName}
                    onValueChange={(val) => setFormData({ ...formData, fullName: val })}
                    classNames={{
                      label: "text-gray-700 font-medium text-sm",
                      input: "text-gray-900 placeholder:text-gray-400",
                      inputWrapper: "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm",
                    }}
                  />

                  <Input
                    labelPlacement="outside"
                    type="email"
                    label="Email Address (Optional) / ইমেইল"
                    placeholder="e.g. mistri@example.com"
                    variant="bordered"
                    value={formData.email}
                    onValueChange={(val) => setFormData({ ...formData, email: val })}
                    classNames={{
                      label: "text-gray-700 font-medium text-sm",
                      input: "text-gray-900 placeholder:text-gray-400",
                      inputWrapper: "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    isRequired
                    labelPlacement="outside"
                    type="tel"
                    label="Mobile Phone / মোবাইল নম্বর"
                    placeholder="e.g. 01700000000"
                    variant="bordered"
                    value={formData.phone}
                    onValueChange={(val) => setFormData({ ...formData, phone: val })}
                    classNames={{
                      label: "text-gray-700 font-medium text-sm",
                      input: "text-gray-900 placeholder:text-gray-400",
                      inputWrapper: "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm",
                    }}
                  />

                  <Select
                    isRequired
                    aria-label="Service Category / কাজের ধরন"
                    labelPlacement="outside"
                    label="Service Category / কাজের ধরন"
                    variant="bordered"
                    selectedKeys={new Set([formData.serviceType])}
                    disallowEmptySelection
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) setFormData((prev) => ({ ...prev, serviceType: selected }));
                    }}
                    classNames={{
                      label: "text-gray-700 font-medium text-sm",
                      value: "text-gray-900",
                      trigger: "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm cursor-pointer",
                      popoverContent: "bg-white border border-gray-200 text-gray-900 shadow-md z-50",
                    }}
                  >
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat.key} textValue={cat.label} className="text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Select
                    isRequired
                    aria-label="City / Division"
                    labelPlacement="outside"
                    label="City / Division"
                    variant="bordered"
                    selectedKeys={new Set([formData.city])}
                    disallowEmptySelection
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) setFormData((prev) => ({ ...prev, city: selected }));
                    }}
                    classNames={{
                      label: "text-gray-700 font-medium text-sm",
                      value: "text-gray-900",
                      trigger: "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm cursor-pointer",
                      popoverContent: "bg-white border border-gray-200 text-gray-900 shadow-md z-50",
                    }}
                  >
                    {cities.map((city) => (
                      <SelectItem key={city.key} textValue={city.label} className="text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer">
                        {city.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    labelPlacement="outside"
                    type="text"
                    label="District (Zilla / জেলা)"
                    placeholder="e.g. Mymensingh, Bogra, Comilla..."
                    variant="bordered"
                    value={formData.zilla}
                    onValueChange={(val) => setFormData({ ...formData, zilla: val })}
                    classNames={{
                      label: "text-gray-700 font-medium text-sm",
                      input: "text-gray-900 placeholder:text-gray-400",
                      inputWrapper: "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    labelPlacement="outside"
                    type="text"
                    label="Upazila / Thana (উপজেলা / থানা)"
                    placeholder="e.g. Mirpur, Sadar, Savar..."
                    variant="bordered"
                    value={formData.upazila}
                    onValueChange={(val) => setFormData({ ...formData, upazila: val })}
                    classNames={{
                      label: "text-gray-700 font-medium text-sm",
                      input: "text-gray-900 placeholder:text-gray-400",
                      inputWrapper: "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm",
                    }}
                  />

                  <Input
                    labelPlacement="outside"
                    type="text"
                    label="Village / Area (গ্রাম / ইউনিয়ন / এলাকা)"
                    placeholder="e.g. Ward 4, Rampura, Postogola..."
                    variant="bordered"
                    value={formData.village}
                    onValueChange={(val) => setFormData({ ...formData, village: val })}
                    classNames={{
                      label: "text-gray-700 font-medium text-sm",
                      input: "text-gray-900 placeholder:text-gray-400",
                      inputWrapper: "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm",
                    }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Select
                    isRequired
                    aria-label="Experience Level"
                    labelPlacement="outside"
                    label="Experience Level"
                    variant="bordered"
                    selectedKeys={new Set([formData.experience])}
                    disallowEmptySelection
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) setFormData((prev) => ({ ...prev, experience: selected }));
                    }}
                    classNames={{
                      label: "text-gray-700 font-medium text-sm",
                      value: "text-gray-900",
                      trigger: "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm cursor-pointer",
                      popoverContent: "bg-white border border-gray-200 text-gray-900 shadow-md z-50",
                    }}
                  >
                    {experienceLevels.map((exp) => (
                      <SelectItem key={exp.key} textValue={exp.label} className="text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer">
                        {exp.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <Textarea
                  labelPlacement="outside"
                  label="Specialty / Experience Summary (Optional)"
                  placeholder="Briefly describe your services (e.g., house wiring, industrial plumbing, floor tiling)..."
                  variant="bordered"
                  minRows={3}
                  value={formData.details}
                  onValueChange={(val) => setFormData({ ...formData, details: val })}
                  classNames={{
                    label: "text-gray-700 font-medium text-sm",
                    input: "text-gray-900 placeholder:text-gray-400",
                    inputWrapper: "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm",
                  }}
                />

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold shadow-md rounded-xl transition-all hover:scale-[1.01]"
                >
                  {isSubmitting ? "Submitting Profile..." : "Register Free Worker Profile"}
                </Button>
              </form>
            )}
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/" className="text-xs font-semibold text-gray-600 hover:text-emerald-600">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
