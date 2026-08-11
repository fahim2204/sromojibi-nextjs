"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  Card,
  CardBody,
  Chip,
} from "@nextui-org/react";
import {
  MapPin,
  CheckCircle2,
  PhoneCall,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { APP_API } from "@/constants/api";

interface LocationItem {
  id: string;
  title_bn: string | null;
  title_en: string | null;
}

interface DistrictItem extends LocationItem {
  upazilas?: LocationItem[];
}

interface DivisionItem extends LocationItem {
  districts: DistrictItem[];
}

export default function JoinWorkerPage() {
  // Cascading Address State
  const [divisions, setDivisions] = useState<DivisionItem[]>([]);
  const [loadingDivisions, setLoadingDivisions] = useState(true);

  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("");
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("");
  const [selectedUpazilaId, setSelectedUpazilaId] = useState<string>("");
  const [selectedUnionId, setSelectedUnionId] = useState<string>("");

  const [upazilasList, setUpazilasList] = useState<LocationItem[]>([]);
  const [loadingUpazilas, setLoadingUpazilas] = useState(false);

  const [unionsList, setUnionsList] = useState<LocationItem[]>([]);
  const [loadingUnions, setLoadingUnions] = useState(false);

  const [selectedTrades, setSelectedTrades] = useState<string[]>(["Electrician"]);

  // Form Data State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "Electrician",
    city: "", // Division title
    zilla: "", // District title
    upazila: "", // Upazila title
    village: "", // Union title
    experience: "3 Years",
    details: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Initial Load: Fetch Divisions & Districts
  useEffect(() => {
    async function fetchHierarchy() {
      try {
        setLoadingDivisions(true);
        const res = await fetch("/api/v1/locations/hierarchy");
        if (!res.ok) throw new Error("Failed to load locations");
        const json = await res.json();
        if (json.data && Array.isArray(json.data)) {
          setDivisions(json.data);
        }
      } catch (err) {
        console.error("Error loading location hierarchy:", err);
      } finally {
        setLoadingDivisions(false);
      }
    }
    fetchHierarchy();
  }, []);

  // 2. Division Selection Handler
  const handleDivisionChange = (divisionId: string) => {
    setSelectedDivisionId(divisionId);
    setSelectedDistrictId("");
    setSelectedUpazilaId("");
    setSelectedUnionId("");
    setUpazilasList([]);
    setUnionsList([]);

    const divObj = divisions.find((d) => d.id === divisionId);
    const divName = divObj?.title_en || divObj?.title_bn || "";

    setFormData((prev) => ({
      ...prev,
      city: divName,
      zilla: "",
      upazila: "",
      village: "",
    }));
  };

  // 3. District Selection Handler: Fetch Upazilas
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedUpazilaId("");
    setSelectedUnionId("");
    setUnionsList([]);

    const activeDiv = divisions.find((d) => d.id === selectedDivisionId);
    const distObj = activeDiv?.districts.find((d) => d.id === districtId);
    const distName = distObj?.title_en || distObj?.title_bn || "";

    setFormData((prev) => ({
      ...prev,
      zilla: distName,
      upazila: "",
      village: "",
    }));

    if (!districtId) return;

    try {
      setLoadingUpazilas(true);
      const res = await fetch(`/api/v1/locations/hierarchy?district_id=${districtId}`);
      if (!res.ok) throw new Error("Failed to load upazilas");
      const json = await res.json();
      if (json.data && json.data.upazilas) {
        setUpazilasList(json.data.upazilas);
      }
    } catch (err) {
      console.error("Error fetching upazilas:", err);
    } finally {
      setLoadingUpazilas(false);
    }
  };

  // 4. Upazila Selection Handler: Fetch Unions
  const handleUpazilaChange = async (upazilaId: string) => {
    setSelectedUpazilaId(upazilaId);
    setSelectedUnionId("");

    const upzObj = upazilasList.find((u) => u.id === upazilaId);
    const upzName = upzObj?.title_en || upzObj?.title_bn || "";

    setFormData((prev) => ({
      ...prev,
      upazila: upzName,
      village: "",
    }));

    if (!upazilaId) return;

    try {
      setLoadingUnions(true);
      const res = await fetch(`/api/v1/locations/hierarchy?upazila_id=${upazilaId}`);
      if (!res.ok) throw new Error("Failed to load unions");
      const json = await res.json();
      if (json.data && json.data.unions) {
        setUnionsList(json.data.unions);
      }
    } catch (err) {
      console.error("Error fetching unions:", err);
    } finally {
      setLoadingUnions(false);
    }
  };

  // 5. Union Selection Handler
  const handleUnionChange = (unionId: string) => {
    setSelectedUnionId(unionId);
    const unionObj = unionsList.find((u) => u.id === unionId);
    const unionName = unionObj?.title_bn || unionObj?.title_en || "";

    setFormData((prev) => ({
      ...prev,
      village: unionName,
    }));
  };

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await fetch(APP_API.WORKERS.BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          divisionId: selectedDivisionId,
          districtId: selectedDistrictId,
          upazilaId: selectedUpazilaId,
          unionId: selectedUnionId,
        }),
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

  const experienceLevels = [
    { key: "Less than 1 Year", label: "Less than 1 Year (১ বছরের কম / শিক্ষানবিস)" },
    { key: "1 Year", label: "1 Year (১ বছর)" },
    { key: "2 Years", label: "2 Years (২ বছর)" },
    { key: "3 Years", label: "3 Years (৩ বছর)" },
    { key: "4 Years", label: "4 Years (৪ বছর)" },
    { key: "5 Years", label: "5 Years (৫ বছর)" },
    { key: "6-8 Years", label: "6 - 8 Years (৬ - ৮ বছর)" },
    { key: "8-10 Years", label: "8 - 10 Years (৮ - ১০ বছর)" },
    { key: "10-15 Years", label: "10 - 15 Years (১০ - ১৫ বছর Senior)" },
    { key: "15+ Years", label: "15+ Years Master (১৫+ বছর হেড মিস্ত্রি / মাস্টার)" },
  ];

  // Active Districts for selected Division
  const currentDistricts = useMemo(() => {
    const activeDiv = divisions.find((d) => d.id === selectedDivisionId);
    return activeDiv ? activeDiv.districts : [];
  }, [divisions, selectedDivisionId]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Hero Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-extrabold uppercase tracking-wider shadow-2xs">
            <Zap className="w-3.5 h-3.5 text-emerald-600" />
            ফ্রি মিস্ত্রি নিবন্ধন • Worker Profile Registration
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
            আপনি কি দক্ষ মিস্ত্রি বা কারিগর?
          </h1>
          <p className="text-slate-600 text-xs sm:text-base leading-relaxed">
            শ্রমজীবী প্ল্যাটফর্মে ফ্রি প্রোফাইল তৈরি করুন। আপনার বিভাগ, জেলা, উপজেলা ও ইউনিয়ন সিলেক্ট করে কাস্টমারদের কাছ থেকে সরাসরি ফোন কলের সুবিধা নিন।
          </p>
        </div>

        {/* Top Benefits Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2.5 p-1">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">১০০% ফ্রি</div>
              <div className="text-[10px] text-slate-400">কোনো হিডেন ফি নেই</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0">
              <PhoneCall className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">সরাসরি কল</div>
              <div className="text-[10px] text-slate-400">কাস্টমার ডিরেক্ট কল করবে</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">ইউনিয়ন কভারেজ</div>
              <div className="text-[10px] text-slate-400">ওয়ার্ড/ইউনিয়ন অ্যাড্রেস</div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 p-1">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">অনলাইন প্রোফাইল</div>
              <div className="text-[10px] text-slate-400">গুগল সার্চে আসার সুবিধা</div>
            </div>
          </div>
        </div>

        {/* Full-width Form Card */}
        <Card className="border border-slate-200/80 shadow-xs bg-white rounded-3xl w-full">
          <CardBody className="p-6 sm:p-10 space-y-8">
            {submitted ? (
              <div className="py-12 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-3xl">
                  🎉
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-slate-900">রেজিস্ট্রেশন সফল হয়েছে!</h2>
                  <p className="text-slate-600 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                    ধন্যবাদ, <strong className="text-slate-900">{formData.fullName}</strong>। আপনার প্রোফাইল তৈরি হয়েছে।{" "}
                    {formData.zilla && (
                      <span>
                        <strong className="text-emerald-700">{formData.zilla}</strong> জেলার{" "}
                      </span>
                    )}
                    {formData.upazila && (
                      <span>
                        <strong className="text-blue-700">{formData.upazila}</strong> উপজেলার{" "}
                      </span>
                    )}
                    {formData.village && (
                      <span>
                        <strong className="text-purple-700">{formData.village}</strong> ইউনিয়নে{" "}
                      </span>
                    )}
                    কাস্টমারদের কাছে আপনার প্রোফাইল প্রদর্শিত হবে।
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Button
                    onPress={() => {
                      setSubmitted(false);
                      setSelectedDivisionId("");
                      setSelectedDistrictId("");
                      setSelectedUpazilaId("");
                      setSelectedUnionId("");
                      setSelectedTrades(["Electrician"]);
                      setFormData({
                        fullName: "",
                        email: "",
                        phone: "",
                        serviceType: "Electrician",
                        city: "",
                        zilla: "",
                        upazila: "",
                        village: "",
                        experience: "3 Years",
                        details: "",
                      });
                    }}
                    className="bg-slate-900 text-white font-bold text-xs rounded-xl px-6"
                  >
                    আরেকটি প্রোফাইল তৈরি করুন
                  </Button>
                  <Button
                    as={Link}
                    href="/locations"
                    variant="flat"
                    className="bg-slate-100 text-slate-700 font-bold text-xs rounded-xl px-6"
                  >
                    ডিরেক্টরি দেখুন
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-xl font-extrabold text-slate-900">ফ্রি প্রোফাইল তথ্য পূরণ করুন</h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Please provide accurate phone number and cascading address up to Union.
                  </p>
                </div>

                {/* Step 1: Personal & Contact Details */}
                <div className="space-y-7 sm:space-y-8">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-1">
                    <span className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">1</span>
                    <span>ব্যক্তিগত তথ্য (Personal Info)</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Input
                      isRequired
                      labelPlacement="outside"
                      type="text"
                      label="Full Name / নাম"
                      placeholder="যেমন: আবুল কাশেম মিস্ত্রি"
                      variant="bordered"
                      value={formData.fullName}
                      onValueChange={(val) => setFormData({ ...formData, fullName: val })}
                      classNames={{
                        label: "text-slate-700 font-semibold text-xs mb-1.5",
                        input: "text-slate-900 text-sm placeholder:text-slate-400",
                        inputWrapper: "border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 bg-slate-50/50 rounded-xl shadow-2xs h-11",
                      }}
                    />

                    <Input
                      isRequired
                      labelPlacement="outside"
                      type="tel"
                      label="Mobile Phone / মোবাইল নম্বর"
                      placeholder="যেমন: 01700000000"
                      variant="bordered"
                      value={formData.phone}
                      onValueChange={(val) => setFormData({ ...formData, phone: val })}
                      classNames={{
                        label: "text-slate-700 font-semibold text-xs mb-1.5",
                        input: "text-slate-900 text-sm placeholder:text-slate-400",
                        inputWrapper: "border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 bg-slate-50/50 rounded-xl shadow-2xs h-11",
                      }}
                    />
                  </div>

                  {/* Full-width Service Trade Multi-Select */}
                  <Select
                    isRequired
                    selectionMode="multiple"
                    aria-label="Service Category / কাজের ধরন"
                    labelPlacement="outside"
                    label={`Service Trade / কাজের ধরন (Up to 3 Trades / সর্বোচ্চ ৩ টি - Selected: ${selectedTrades.length}/3)`}
                    placeholder="Select up to 3 trades"
                    variant="bordered"
                    selectedKeys={new Set(selectedTrades)}
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys) as string[];
                      if (selected.length > 0 && selected.length <= 3) {
                        setSelectedTrades(selected);
                        setFormData((prev) => ({
                          ...prev,
                          serviceType: selected.join(", "),
                        }));
                      }
                    }}
                    classNames={{
                      label: "text-slate-700 font-semibold text-xs mb-1.5",
                      value: "text-slate-900 text-sm",
                      trigger: "border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 bg-slate-50/50 rounded-xl shadow-2xs cursor-pointer min-h-11 py-1 w-full",
                      popoverContent: "bg-white border border-slate-200 text-slate-900 shadow-xl z-50",
                    }}
                    renderValue={(items) => (
                      <div className="flex flex-wrap gap-1.5 py-0.5">
                        {items.map((item) => (
                          <Chip key={item.key} size="sm" variant="flat" color="success" className="text-[10px] font-bold">
                            {item.textValue || item.key}
                          </Chip>
                        ))}
                      </div>
                    )}
                  >
                    {serviceCategories.map((cat) => (
                      <SelectItem
                        key={cat.key}
                        textValue={cat.label}
                        isDisabled={selectedTrades.length >= 3 && !selectedTrades.includes(cat.key)}
                        className="text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer text-xs"
                      >
                        {cat.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Select
                    isRequired
                    aria-label="Experience Level"
                    labelPlacement="outside"
                    label="Experience / কাজের অভিজ্ঞতা"
                    variant="bordered"
                    selectedKeys={new Set([formData.experience])}
                    disallowEmptySelection
                    onSelectionChange={(keys) => {
                      const selected = Array.from(keys)[0] as string;
                      if (selected) setFormData((prev) => ({ ...prev, experience: selected }));
                    }}
                    classNames={{
                      label: "text-slate-700 font-semibold text-xs mb-1.5",
                      value: "text-slate-900 text-sm",
                      trigger: "border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 bg-slate-50/50 rounded-xl shadow-2xs cursor-pointer h-11",
                      popoverContent: "bg-white border border-slate-200 text-slate-900 shadow-xl z-50",
                    }}
                  >
                    {experienceLevels.map((exp) => (
                      <SelectItem key={exp.key} textValue={exp.label} className="text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer text-xs">
                        {exp.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {/* Step 2: Cascading Address Hierarchy up to Union */}
                <div className="space-y-7 sm:space-y-8 pt-6">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">2</span>
                    <span>ঠিকানা নির্বাচন করুন (Cascading Address up to Union)</span>
                  </div>

                  {/* Division & District Select */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Select
                      isRequired
                      aria-label="Division / বিভাগ"
                      labelPlacement="outside"
                      label="Division / বিভাগ"
                      placeholder={loadingDivisions ? "Loading Divisions..." : "Select Division"}
                      variant="bordered"
                      selectedKeys={selectedDivisionId ? new Set([selectedDivisionId]) : new Set()}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        if (selected) handleDivisionChange(selected);
                      }}
                      isLoading={loadingDivisions}
                      classNames={{
                        label: "text-slate-700 font-semibold text-xs mb-1.5",
                        value: "text-slate-900 text-sm",
                        trigger: "border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 bg-slate-50/50 rounded-xl shadow-2xs cursor-pointer h-11",
                        popoverContent: "bg-white border border-slate-200 text-slate-900 shadow-xl z-50 max-h-60",
                      }}
                    >
                      {divisions.map((div) => (
                        <SelectItem key={div.id} textValue={div.title_bn || div.title_en || ""} className="text-slate-800 text-xs">
                          {div.title_bn} ({div.title_en})
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      isRequired
                      isDisabled={!selectedDivisionId}
                      aria-label="District / জেলা"
                      labelPlacement="outside"
                      label="District / জেলা"
                      placeholder={!selectedDivisionId ? "Select Division First" : "Select District"}
                      variant="bordered"
                      selectedKeys={selectedDistrictId ? new Set([selectedDistrictId]) : new Set()}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        if (selected) handleDistrictChange(selected);
                      }}
                      classNames={{
                        label: "text-slate-700 font-semibold text-xs mb-1.5",
                        value: "text-slate-900 text-sm",
                        trigger: "border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 bg-slate-50/50 rounded-xl shadow-2xs cursor-pointer h-11",
                        popoverContent: "bg-white border border-slate-200 text-slate-900 shadow-xl z-50 max-h-60",
                      }}
                    >
                      {currentDistricts.map((dist: DistrictItem) => (
                        <SelectItem key={dist.id} textValue={dist.title_bn || dist.title_en || ""} className="text-slate-800 text-xs">
                          {dist.title_bn} ({dist.title_en})
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Upazila & Union Select */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Select
                      isRequired
                      isDisabled={!selectedDistrictId || loadingUpazilas}
                      aria-label="Upazila / উপজেলা"
                      labelPlacement="outside"
                      label="Upazila / উপজেলা (থানা)"
                      placeholder={
                        !selectedDistrictId
                          ? "Select District First"
                          : loadingUpazilas
                          ? "Loading Upazilas..."
                          : "Select Upazila"
                      }
                      variant="bordered"
                      selectedKeys={selectedUpazilaId ? new Set([selectedUpazilaId]) : new Set()}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        if (selected) handleUpazilaChange(selected);
                      }}
                      isLoading={loadingUpazilas}
                      classNames={{
                        label: "text-slate-700 font-semibold text-xs mb-1.5",
                        value: "text-slate-900 text-sm",
                        trigger: "border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 bg-slate-50/50 rounded-xl shadow-2xs cursor-pointer h-11",
                        popoverContent: "bg-white border border-slate-200 text-slate-900 shadow-xl z-50 max-h-60",
                      }}
                    >
                      {upazilasList.map((upz) => (
                        <SelectItem key={upz.id} textValue={upz.title_bn || upz.title_en || ""} className="text-slate-800 text-xs">
                          {upz.title_bn} {upz.title_en ? `(${upz.title_en})` : ""}
                        </SelectItem>
                      ))}
                    </Select>

                    <Select
                      isDisabled={!selectedUpazilaId || loadingUnions}
                      aria-label="Union / ইউনিয়ন"
                      labelPlacement="outside"
                      label="Union / ইউনিয়ন (ওয়ার্ড/এলাকা)"
                      placeholder={
                        !selectedUpazilaId
                          ? "Select Upazila First"
                          : loadingUnions
                          ? "Loading Unions..."
                          : unionsList.length === 0
                          ? "No Unions Found"
                          : "Select Union"
                      }
                      variant="bordered"
                      selectedKeys={selectedUnionId ? new Set([selectedUnionId]) : new Set()}
                      onSelectionChange={(keys) => {
                        const selected = Array.from(keys)[0] as string;
                        if (selected) handleUnionChange(selected);
                      }}
                      isLoading={loadingUnions}
                      classNames={{
                        label: "text-slate-700 font-semibold text-xs mb-1.5",
                        value: "text-slate-900 text-sm",
                        trigger: "border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 bg-slate-50/50 rounded-xl shadow-2xs cursor-pointer h-11",
                        popoverContent: "bg-white border border-slate-200 text-slate-900 shadow-xl z-50 max-h-60",
                      }}
                    >
                      {unionsList.map((union) => (
                        <SelectItem key={union.id} textValue={union.title_bn || union.title_en || ""} className="text-slate-800 text-xs">
                          {union.title_bn} {union.title_en ? `(${union.title_en})` : ""}
                        </SelectItem>
                      ))}
                    </Select>
                  </div>

                  {/* Selected Location Summary Badge */}
                  {(formData.city || formData.zilla || formData.upazila || formData.village) && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        নির্বাচিত পূর্ণাঙ্গ ঠিকানা (Selected Address Summary):
                      </div>
                      <div className="flex flex-wrap gap-1.5 font-medium pt-0.5">
                        {formData.city && <Chip size="sm" variant="flat" color="default" className="text-[10px]">{formData.city} বিভাগ</Chip>}
                        {formData.zilla && <Chip size="sm" variant="flat" color="success" className="text-[10px]">{formData.zilla} জেলা</Chip>}
                        {formData.upazila && <Chip size="sm" variant="flat" color="primary" className="text-[10px]">{formData.upazila} উপজেলা</Chip>}
                        {formData.village && <Chip size="sm" variant="flat" color="warning" className="text-[10px]">{formData.village} ইউনিয়ন</Chip>}
                      </div>
                    </div>
                  )}
                </div>

                {/* Step 3: Specialty Summary & Optional Email */}
                <div className="space-y-4 pt-2">
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 pb-6">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">3</span>
                    <span>অতিরিক্ত বিবরণ (Optional Details)</span>
                  </div>

                  <Input
                    labelPlacement="outside"
                    type="email"
                    label="Email Address (Optional) / ইমেইল"
                    placeholder="যেমন: mistri@example.com"
                    variant="bordered"
                    value={formData.email}
                    onValueChange={(val) => setFormData({ ...formData, email: val })}
                    classNames={{
                      label: "text-slate-700 font-semibold text-xs",
                      input: "text-slate-900 text-sm placeholder:text-slate-400",
                      inputWrapper: "border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 bg-slate-50/50 rounded-xl shadow-2xs",
                    }}
                  />

                  <Textarea
                    labelPlacement="outside"
                    label="Specialty / Experience Summary (Optional)"
                    placeholder="আপনার কাজ বা দক্ষতার সংক্ষিপ্ত বিবরণ লিখুন (যেমন: হাউজ ওয়্যারিং, স্যানিটারি ফিটিং, ফ্লোর টাইলস)..."
                    variant="bordered"
                    minRows={3}
                    value={formData.details}
                    onValueChange={(val) => setFormData({ ...formData, details: val })}
                    classNames={{
                      label: "text-slate-700 font-semibold text-xs",
                      input: "text-slate-900 text-sm placeholder:text-slate-400",
                      inputWrapper: "border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-500 bg-slate-50/50 rounded-xl shadow-2xs",
                    }}
                  />
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
                    {errorMsg}
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  isLoading={isSubmitting}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-md rounded-xl transition-all hover:scale-[1.005]"
                  endContent={!isSubmitting && <ArrowRight className="w-4 h-4" />}
                >
                  {isSubmitting ? "Submitting Profile..." : "ফ্রি প্রোফাইল সাবমিট করুন (Register Free Profile)"}
                </Button>
              </form>
            )}
          </CardBody>
        </Card>

        <div className="text-center pt-2">
          <Link href="/" className="text-xs font-semibold text-slate-500 hover:text-emerald-600">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
