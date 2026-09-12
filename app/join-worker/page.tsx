"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Input,
  Select,
  SelectItem,
  SelectSection,
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
  Lock,
  UserCheck,
  Sparkles,
  User,
  Building2,
  Navigation,
} from "lucide-react";
import { APP_API } from "@/constants/api";
import { useAuth } from "@/hooks/useAuth";
import GoogleAuthButton from "@/app/(auth)/_components/GoogleAuthButton";

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
  const [cityAreasList, setCityAreasList] = useState<LocationItem[]>([]);
  const [loadingUnions, setLoadingUnions] = useState(false);

  const [selectedTrades, setSelectedTrades] = useState<string[]>(["Electrician"]);
  const [coverageScope, setCoverageScope] = useState<"SPECIFIC_AREA" | "ALL_UPAZILA" | "ALL_DISTRICT" | "ALL_DIVISION" | "NATIONWIDE">("SPECIFIC_AREA");

  // Form Data State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "Electrician",
    city: "", // Division title
    zilla: "", // District title
    upazila: "", // Upazila / Metro Thana title
    village: "", // Union title (for rural upazilas)
    experience: "3 Years",
    details: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { user, isAuthenticated, isLoading } = useAuth();

  // Auto-fill user information if logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || "",
        email: prev.email || user.email || "",
      }));
    }
  }, [user]);

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

  // Adaptive Hierarchy: "urban" (City Corp / Thana ➔ City Area) vs "rural" (Upazila ➔ Union)
  const [addressType, setAddressType] = useState<"urban" | "rural">("urban");

  // Categorize Upazilas into City Areas (from DB) vs District Upazilas
  const categorizedUpazilas = useMemo(() => {
    // 1. If DB has City Areas for this District:
    if (cityAreasList.length > 0) {
      return {
        hasCityCorp: true,
        citySectionTitle: "🏙️ সিটি এলাকা / মেট্রো থানা",
        cityItems: cityAreasList,
        upazilaSectionTitle: "🌾 অন্যান্য উপজেলাসমূহ",
        upazilaItems: upazilasList,
      };
    }

    // 2. Fallback: check if any upazila is a Sadar/Paurashava
    const sadarMatch = upazilasList.find((u) => {
      const title = (u.title_en || u.title_bn || "").toLowerCase();
      return title.includes("sadar") || title.includes("সদর");
    });

    if (sadarMatch) {
      return {
        hasCityCorp: true,
        citySectionTitle: `🏙️ ${sadarMatch.title_bn || sadarMatch.title_en} (পৌরসভা / সদর)`,
        cityItems: [sadarMatch],
        upazilaSectionTitle: `🌾 অন্যান্য উপজেলাসমূহ`,
        upazilaItems: upazilasList.filter((u) => u.id !== sadarMatch.id),
      };
    }

    return {
      hasCityCorp: false,
      citySectionTitle: "",
      cityItems: [],
      upazilaSectionTitle: "উপজেলাসমূহ (Upazilas)",
      upazilaItems: upazilasList,
    };
  }, [cityAreasList, upazilasList]);

  // 2. Division Selection Handler
  const handleDivisionChange = (divisionId: string) => {
    setSelectedDivisionId(divisionId);
    setSelectedDistrictId("");
    setSelectedUpazilaId("");
    setSelectedUnionId("");
    setCoverageScope("SPECIFIC_AREA");
    setUpazilasList([]);
    setCityAreasList([]);
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

  // 3. District Selection Handler: Fetch Upazilas and City Areas from DB
  const handleDistrictChange = async (districtId: string) => {
    setSelectedDistrictId(districtId);
    setSelectedUpazilaId("");
    setSelectedUnionId("");
    setCoverageScope("SPECIFIC_AREA");
    setUpazilasList([]);
    setCityAreasList([]);
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
      if (json.data) {
        setUpazilasList(json.data.upazilas || []);
        setCityAreasList(json.data.city_areas || []);
      }
    } catch (err) {
      console.error("Error fetching upazilas:", err);
    } finally {
      setLoadingUpazilas(false);
    }
  };

  // 4. Upazila / Thana Selection Handler
  const handleUpazilaChange = async (upazilaId: string) => {
    setSelectedUpazilaId(upazilaId);
    setSelectedUnionId("");

    // Option: All Over District (পুরো জেলা জুড়ে)
    if (upazilaId === "scope_all_district") {
      setCoverageScope("ALL_DISTRICT");
      setFormData((prev) => ({
        ...prev,
        upazila: `পুরো ${prev.zilla || "জেলা"} জুড়ে`,
        village: "",
      }));
      setUnionsList([]);
      return;
    }

    setCoverageScope("SPECIFIC_AREA");
    const allItems = [...categorizedUpazilas.cityItems, ...categorizedUpazilas.upazilaItems];
    const upzObj = allItems.find((u) => u.id === upazilaId) || upazilasList.find((u) => u.id === upazilaId);
    const upzName = upzObj?.title_en || upzObj?.title_bn || "";

    const isSelectedCityArea = cityAreasList.some((c) => c.id === upazilaId);
    const isCity =
      isSelectedCityArea ||
      upzName.toLowerCase().includes("sadar") ||
      upzName.includes("সদর");

    setFormData((prev) => ({
      ...prev,
      upazila: upzName,
      village: isCity ? upzName : "",
    }));

    if (!upazilaId) return;

    // For city thanas/areas or sadar, stop right here - no unions needed!
    if (isCity) {
      setAddressType("urban");
      setUnionsList([]);
      return;
    }

    setAddressType("rural");

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

  // 5. Union Selection Handler (For Rural Upazilas)
  const handleUnionChange = (unionId: string) => {
    setSelectedUnionId(unionId);

    // Option: All Over Upazila (পুরো উপজেলা জুড়ে)
    if (unionId === "scope_all_upazila") {
      setCoverageScope("ALL_UPAZILA");
      setFormData((prev) => ({
        ...prev,
        village: `পুরো ${prev.upazila || "উপজেলা"} জুড়ে`,
      }));
      return;
    }

    setCoverageScope("SPECIFIC_AREA");
    const unionObj = unionsList.find((u) => u.id === unionId);
    const unionName = unionObj?.title_bn || unionObj?.title_en || "";

    setFormData((prev) => ({
      ...prev,
      village: unionName,
    }));
  };

  // Detect if current selection is a City Thana or District-Wide Scope
  const isCityThana = useMemo(() => {
    if (!selectedUpazilaId) return false;
    if (selectedUpazilaId === "scope_all_district") return true;
    if (cityAreasList.some((c) => c.id === selectedUpazilaId)) return true;
    const upzLower = (formData.upazila || "").toLowerCase();
    return (
      upzLower.includes("sadar") ||
      upzLower.includes("সদর") ||
      upzLower.includes("city") ||
      upzLower.includes("সিটি")
    );
  }, [selectedUpazilaId, formData.upazila, cityAreasList]);

  // Form Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setErrorMsg("প্রোফাইল নিবন্ধন করতে অনুগ্রহ করে প্রথমে আপনার অ্যাকাউন্টে লগইন করুন।");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("@sromojibi_token") : null;

      if (!token) {
        throw new Error("আপনার সেশন পাওয়া যায়নি। অনুগ্রহ করে পুনরায় লগইন করুন।");
      }

      const isSelectedCityArea = cityAreasList.some((c) => c.id === selectedUpazilaId);

      const isRealUpazila =
        selectedUpazilaId &&
        !isSelectedCityArea &&
        selectedUpazilaId !== "scope_all_district";

      const isRealUnion =
        selectedUnionId &&
        selectedUnionId !== "scope_all_upazila";

      const res = await fetch(APP_API.WORKERS.BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          experience: parseInt(String(formData.experience).replace(/[^0-9]/g, "")) || 1,
          serviceTypes: selectedTrades,
          coverageScope,
          details: formData.details || undefined,
          divisionId: selectedDivisionId || undefined,
          districtId: selectedDistrictId || undefined,
          upazilaId: isRealUpazila ? selectedUpazilaId : undefined,
          cityAreaId: isSelectedCityArea ? selectedUpazilaId : undefined,
          unionId: isRealUnion ? selectedUnionId : undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error?.message || json.message || "Registration failed. Please try again.");
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
                        <strong className="text-blue-700">{formData.upazila}</strong> {isCityThana ? "এলাকার " : "উপজেলার "}
                      </span>
                    )}
                    {formData.village && !isCityThana && (
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
                      setCoverageScope("SPECIFIC_AREA");
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
            ) : isLoading ? (
              <div className="py-20 text-center space-y-4">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent mx-auto" />
                <p className="text-xs font-semibold text-slate-500">লোড হচ্ছে... (Checking account status)</p>
              </div>
            ) : !isAuthenticated ? (
              <div className="space-y-8">
                {/* Auth Gate Header */}
                <div className="text-center space-y-3 max-w-xl mx-auto">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
                    <Lock className="w-3.5 h-3.5 text-amber-600" />
                    <span>লগইন আবশ্যক • Account Required</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    মিস্ত্রি প্রোফাইল রেজিস্টার করতে সাইন-ইন করুন
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    শ্রমজীবী প্ল্যাটফর্মে আপনার প্রোফাইল তৈরি ও ভবিষ্যৎ পরিচালনার জন্য একটি ভেরিফাইড অ্যাকাউন্ট থাকা আবশ্যক। মাত্র ১ মিনিটে ফ্রি অ্যাকাউন্ট খুলে বা সরাসরি গুগল দিয়ে সাইন-ইন করে প্রোফাইল সম্পন্ন করুন।
                  </p>
                </div>

                {/* Authentication Action Box */}
                <div className="max-w-md mx-auto bg-slate-50/80 border border-slate-200 rounded-2xl p-6 sm:p-7 space-y-4">
                  <div className="space-y-3">
                    <GoogleAuthButton label="গুগল দিয়ে সরাসরি এগিয়ে যান" redirect="/join-worker" />

                    <div className="relative flex items-center justify-center my-2">
                      <div className="border-t border-slate-200 w-full" />
                      <span className="bg-slate-50 px-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 absolute">
                        অথবা ইমেইল
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <Button
                        as={Link}
                        href="/sign-in?redirect=/join-worker"
                        variant="bordered"
                        className="w-full bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-100 text-slate-800 font-bold text-xs rounded-xl h-10 transition-colors"
                      >
                        লগইন করুন (Sign In)
                      </Button>
                      <Button
                        as={Link}
                        href="/sign-up?redirect=/join-worker"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl h-10 transition-colors"
                      >
                        নতুন অ্যাকাউন্ট (Sign Up)
                      </Button>
                    </div>
                  </div>

                  <p className="text-[11px] text-center text-slate-500">
                    লগইন বা রেজিস্ট্রেশন সম্পূর্ণ হলে আপনি সরাসরি এই পাতায় ফিরে এসে মিস্ত্রি প্রোফাইল ফর্মটি পূরণ করতে পারবেন।
                  </p>
                </div>

                {/* 3 Value Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">ভেরিফাইড প্রোফাইল ও নিরাপত্তা</h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                      অন্য কেউ আপনার ফোন নম্বর বা নাম দিয়ে ভুয়া প্রোফাইল খুলতে পারবে না। অ্যাকাউন্টের মাধ্যমে আপনি আপনার তথ্যের একমাত্র মালিক।
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                      <UserCheck className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">যে কোনো সময় তথ্য আপডেট</h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                      মোবাইল নম্বর, কাজের এলাকা (বিভাগ/জেলা/উপজেলা/ইউনিয়ন) বা কাজের ধরন পরিবর্তন হলে যখন খুশি এডিট করতে পারবেন।
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-2">
                    <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <h3 className="font-bold text-xs sm:text-sm text-slate-900">সরাসরি কাজ পাওয়ার সুযোগ</h3>
                    <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                      আপনার ইউনিয়নের গ্রাহক ও ঠিকাদাররা সরাসরি গুগল সার্চ ও শ্রমজীবী থেকে আপনার ফোনে কল দিয়ে কাজের চুক্তি করবে।
                    </p>
                  </div>
                </div>

                {/* 3 Step Registration Flow Preview for SEO & Transparency */}
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      মিস্ত্রি নিবন্ধনের ৩টি সহজ ধাপ (How Worker Registration Works)
                    </h3>
                    <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      সময় লাগবে: ২ মিনিট
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">১</span>
                        ব্যক্তিগত তথ্য ও ফোন
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        আপনার পূর্ণ নাম ও সচল ১১ ডিজিট মোবাইল নম্বর দিন, যাতে কাস্টমাররা সরাসরি ফোনে কথা বলতে পারে।
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">২</span>
                        ক্যাসকেডিং পূর্ণ ঠিকানা
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        বিভাগ, জেলা, উপজেলা এবং ইউনিয়ন সিলেক্ট করুন। আপনার এলাকার কাস্টমাররা সহজেই আপনার প্রোফাইল পাবে।
                      </p>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                      <div className="font-bold text-slate-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px]">৩</span>
                        কাজের ট্রেড ও অভিজ্ঞতা
                      </div>
                      <p className="text-slate-500 text-[11px] leading-relaxed">
                        ইলেকট্রিশিয়ান, প্লাম্বার, রাজমিস্ত্রি সহ কাজের ধরন ও অভিজ্ঞতার বছর নির্বাচন করুন।
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Active user status banner */}
                <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {(user?.fullName || user?.username || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">
                        {user?.fullName || user?.username}
                      </div>
                      <div className="text-slate-500 text-xs">
                        {user?.email} • <span className="text-emerald-700 font-semibold">লগইন করা আছে ({user?.role})</span>
                      </div>
                    </div>
                  </div>
                  <Chip size="sm" variant="flat" color="success" className="font-bold text-[11px]">
                    ভেরিফাইড অ্যাকাউন্ট
                  </Chip>
                </div>

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

                {/* Step 2: Cascading Address Hierarchy (City Corp / Thana / Upazila ➔ Area / Union) */}
                <div className="space-y-6 pt-6">
                  {/* Step Header */}
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      2
                    </span>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                        ঠিকানা ও কর্মক্ষেত্র নির্বাচন (Location & Service Coverage)
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          {addressType === "urban" ? "🏙️ সিটি কর্পোরেশন / মেট্রো এলাকা" : "🌾 জেলা ও উপজেলা পরিষদ"}
                        </span>
                      </h3>
                      <p className="text-[11px] text-slate-500 font-medium">
                        {addressType === "urban"
                          ? "বিভাগ ➔ জেলা ➔ মেট্রো থানা ➔ শহরের প্রধান এলাকা ও পয়েন্ট"
                          : "বিভাগ ➔ জেলা ➔ উপজেলা ➔ ইউনিয়ন পরিষদ"}
                      </p>
                    </div>
                  </div>

                  {/* Level 1 & Level 2: Division & District */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Select
                      isRequired
                      aria-label="Level 1: Division / বিভাগ"
                      labelPlacement="outside"
                      label="১. Division / বিভাগ"
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
                      aria-label="Level 2: District / জেলা"
                      labelPlacement="outside"
                      label="২. District / জেলা"
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

                  {/* Level 3 & Level 4: Thana/Upazila & Area/Union */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Select
                      isRequired
                      isDisabled={!selectedDistrictId || loadingUpazilas}
                      aria-label="City Corporation Thana or Upazila"
                      labelPlacement="outside"
                      label="৩. City Corporation / Upazila (সিটি কর্পোরেশন / থানা / উপজেলা)"
                      placeholder={
                        !selectedDistrictId
                          ? "Select District First"
                          : loadingUpazilas
                          ? "Loading Thanas/Upazilas..."
                          : "Select Thana or Upazila"
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
                        popoverContent: "bg-white border border-slate-200 text-slate-900 shadow-xl z-50 max-h-72",
                      }}
                    >
                      <SelectSection
                        title="🌐 কর্মক্ষেত্রের আওতা (Large Coverage Scope)"
                        classNames={{
                          heading: "text-[11px] font-bold text-emerald-800 uppercase bg-emerald-50/80 px-2.5 py-1 rounded",
                        }}
                      >
                        <SelectItem
                          key="scope_all_district"
                          textValue={`পুরো ${formData.zilla || "জেলা"} জুড়ে`}
                          className="text-emerald-800 font-bold text-xs py-1.5 cursor-pointer"
                        >
                          🌐 পুরো {formData.zilla || "জেলা"} জুড়ে কাজ করি (All Over District)
                        </SelectItem>
                      </SelectSection>

                      {categorizedUpazilas.hasCityCorp && categorizedUpazilas.cityItems.length > 0 ? (
                        <SelectSection
                          title={categorizedUpazilas.citySectionTitle}
                          classNames={{
                            heading: "text-[11px] font-bold text-emerald-800 uppercase bg-emerald-50/80 px-2.5 py-1 rounded",
                          }}
                        >
                          {categorizedUpazilas.cityItems.map((upz) => (
                            <SelectItem key={upz.id} textValue={upz.title_bn || upz.title_en || ""} className="text-slate-800 text-xs py-1.5 cursor-pointer">
                              🏙️ {upz.title_bn} {upz.title_en ? `(${upz.title_en})` : ""}
                            </SelectItem>
                          ))}
                        </SelectSection>
                      ) : null}

                      {categorizedUpazilas.hasCityCorp && categorizedUpazilas.upazilaItems.length > 0 ? (
                        <SelectSection
                          title={categorizedUpazilas.upazilaSectionTitle}
                          classNames={{
                            heading: "text-[11px] font-bold text-slate-600 uppercase bg-slate-100 px-2.5 py-1 rounded",
                          }}
                        >
                          {categorizedUpazilas.upazilaItems.map((upz) => (
                            <SelectItem key={upz.id} textValue={upz.title_bn || upz.title_en || ""} className="text-slate-800 text-xs py-1.5 cursor-pointer">
                              🌾 {upz.title_bn} {upz.title_en ? `(${upz.title_en})` : ""}
                            </SelectItem>
                          ))}
                        </SelectSection>
                      ) : null}

                      {!categorizedUpazilas.hasCityCorp ? (
                        <SelectSection title="উপজেলাসমূহ (Upazilas)">
                          {upazilasList.map((upz) => (
                            <SelectItem key={upz.id} textValue={upz.title_bn || upz.title_en || ""} className="text-slate-800 text-xs">
                              {upz.title_bn} {upz.title_en ? `(${upz.title_en})` : ""}
                            </SelectItem>
                          ))}
                        </SelectSection>
                      ) : null}
                    </Select>

                    {/* Only show Union Select for Rural / District Upazila (Stops cleanly for Metro Thanas or District-Wide Scope) */}
                    {!isCityThana && (
                      <Select
                        isRequired
                        isDisabled={!selectedUpazilaId || loadingUnions}
                        aria-label="Union"
                        labelPlacement="outside"
                        label="৪. Union (ইউনিয়ন)"
                        placeholder={
                          !selectedDistrictId
                            ? "Select District First"
                            : !selectedUpazilaId
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
                          popoverContent: "bg-white border border-slate-200 text-slate-900 shadow-xl z-50 max-h-72",
                        }}
                      >
                        <SelectSection
                          title="🌐 কর্মক্ষেত্রের আওতা (Large Coverage Scope)"
                          classNames={{
                            heading: "text-[11px] font-bold text-emerald-800 uppercase bg-emerald-50/80 px-2.5 py-1 rounded",
                          }}
                        >
                          <SelectItem
                            key="scope_all_upazila"
                            textValue={`পুরো ${formData.upazila || "উপজেলা"} জুড়ে`}
                            className="text-emerald-800 font-bold text-xs py-1.5 cursor-pointer"
                          >
                            🌐 পুরো {formData.upazila || "উপজেলা"} জুড়ে কাজ করি (All Over Upazila)
                          </SelectItem>
                        </SelectSection>

                        <SelectSection title="ইউনিয়ন (Union)">
                          {unionsList.map((union) => (
                            <SelectItem
                              key={union.id}
                              textValue={union.title_bn || union.title_en || ""}
                              className="text-slate-800 text-xs py-1.5 cursor-pointer"
                            >
                              {union.title_bn} {union.title_en ? `(${union.title_en})` : ""}
                            </SelectItem>
                          ))}
                        </SelectSection>
                      </Select>
                    )}
                  </div>

                  {/* Selected Location Summary Badge (Hierarchical Breadcrumb) */}
                  {(formData.city || formData.zilla || formData.upazila) && (
                    <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-2">
                      <div className="font-bold flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-800">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                          <span>নির্বাচিত কর্মক্ষেত্র (Selected Coverage Location):</span>
                        </div>
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {coverageScope === "ALL_DISTRICT"
                            ? "🌐 জেলা-ব্যাপী কর্মক্ষেত্র"
                            : coverageScope === "ALL_UPAZILA"
                            ? "🌐 উপজেলা-ব্যাপী কর্মক্ষেত্র"
                            : isCityThana
                            ? "🏙️ সিটি কর্পোরেশন এলাকা"
                            : "🌾 জেলা ও উপজেলা পরিষদ"}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5 font-medium pt-0.5">
                        {formData.city && <Chip size="sm" variant="flat" color="default" className="text-[10px]">{formData.city} বিভাগ</Chip>}
                        {formData.zilla && <Chip size="sm" variant="flat" color="success" className="text-[10px]">{formData.zilla} জেলা</Chip>}
                        {formData.upazila && (
                          <Chip size="sm" variant="flat" color="primary" className="text-[10px]">
                            {formData.upazila} {coverageScope === "ALL_DISTRICT" ? "" : isCityThana ? "মেট্রো থানা" : "উপজেলা"}
                          </Chip>
                        )}
                        {!isCityThana && formData.village && (
                          <Chip size="sm" variant="flat" color="secondary" className="text-[10px] font-semibold">
                            {formData.village} {coverageScope === "ALL_UPAZILA" ? "" : "ইউনিয়ন"}
                          </Chip>
                        )}
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
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs rounded-xl transition-colors h-12"
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
