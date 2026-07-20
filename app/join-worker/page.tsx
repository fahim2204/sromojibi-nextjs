"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input, Select, SelectItem, Textarea, Button } from "@nextui-org/react";

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
                  <Button
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
                    className="bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs"
                  >
                    Submit Another Worker Profile
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-xl font-bold text-white pb-6">Create Free Worker Profile</h2>

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
                    label: "text-gray-300 font-medium text-sm",
                    input: "text-white placeholder:text-gray-500",
                    inputWrapper: "border-gray-800 hover:border-emerald-500 focus-within:!border-emerald-500 bg-gray-950/80 rounded-xl",
                  }}
                />

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
                      label: "text-gray-300 font-medium text-sm",
                      input: "text-white placeholder:text-gray-500",
                      inputWrapper: "border-gray-800 hover:border-emerald-500 focus-within:!border-emerald-500 bg-gray-950/80 rounded-xl",
                    }}
                  />

                  <Select
                    isRequired
                    labelPlacement="outside"
                    label="Service Category / কাজের ধরন"
                    variant="bordered"
                    selectedKeys={[formData.serviceType]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) setFormData({ ...formData, serviceType: selected });
                    }}
                    classNames={{
                      label: "text-gray-300 font-medium text-sm",
                      value: "text-white",
                      trigger: "border-gray-800 hover:border-emerald-500 focus-within:!border-emerald-500 bg-gray-950/80 rounded-xl",
                      popoverContent: "bg-gray-900 border border-gray-800 text-white",
                    }}
                  >
                    {serviceCategories.map((cat) => (
                      <SelectItem key={cat.key} className="text-gray-200 hover:bg-gray-800 hover:text-emerald-400">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Select
                    isRequired
                    labelPlacement="outside"
                    label="City / Division"
                    variant="bordered"
                    selectedKeys={[formData.city]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) setFormData({ ...formData, city: selected });
                    }}
                    classNames={{
                      label: "text-gray-300 font-medium text-sm",
                      value: "text-white",
                      trigger: "border-gray-800 hover:border-emerald-500 focus-within:!border-emerald-500 bg-gray-950/80 rounded-xl",
                      popoverContent: "bg-gray-900 border border-gray-800 text-white",
                    }}
                  >
                    {cities.map((city) => (
                      <SelectItem key={city.key} className="text-gray-200 hover:bg-gray-800 hover:text-emerald-400">
                        {city.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    isRequired
                    labelPlacement="outside"
                    label="Experience Level"
                    variant="bordered"
                    selectedKeys={[formData.experience]}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) setFormData({ ...formData, experience: selected });
                    }}
                    classNames={{
                      label: "text-gray-300 font-medium text-sm",
                      value: "text-white",
                      trigger: "border-gray-800 hover:border-emerald-500 focus-within:!border-emerald-500 bg-gray-950/80 rounded-xl",
                      popoverContent: "bg-gray-900 border border-gray-800 text-white",
                    }}
                  >
                    {experienceLevels.map((exp) => (
                      <SelectItem key={exp.key} className="text-gray-200 hover:bg-gray-800 hover:text-emerald-400">
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
                    label: "text-gray-300 font-medium text-sm",
                    input: "text-white placeholder:text-gray-500",
                    inputWrapper: "border-gray-800 hover:border-emerald-500 focus-within:!border-emerald-500 bg-gray-950/80 rounded-xl",
                  }}
                />

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-gray-950 font-extrabold shadow-lg shadow-emerald-950/50 rounded-xl transition-all hover:scale-[1.01]"
                >
                  Register Free Worker Profile
                </Button>
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
