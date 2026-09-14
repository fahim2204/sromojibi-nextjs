"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Building2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  X,
  Layers,
  Globe,
  Compass,
} from "lucide-react";

export interface AreaItem {
  id: string;
  title_bn: string | null;
  title_en: string | null;
}

export interface DistrictItem {
  id: string;
  title_bn: string | null;
  title_en: string | null;
  upazilas: AreaItem[];
  city_areas?: AreaItem[];
}

export interface DivisionItem {
  id: string;
  title_bn: string | null;
  title_en: string | null;
  districts: DistrictItem[];
}

interface Props {
  divisions: DivisionItem[];
  totalDistricts: number;
  totalUpazilas: number;
  totalCityAreas?: number;
  totalUnions?: number;
}

// Convert English name to clean URL slug e.g. "Mymensingh" -> "mymensingh", "Cox's Bazar" -> "coxs-bazar"
function toSlug(name: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function LocationDirectoryExplorer({
  divisions,
  totalDistricts,
  totalUpazilas,
  totalCityAreas = 26,
  totalUnions = 4536,
}: Props) {
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedDistrictIds, setExpandedDistrictIds] = useState<Record<string, boolean>>({});

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut '/' to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const toggleExpandDistrict = (districtId: string) => {
    setExpandedDistrictIds((prev) => ({
      ...prev,
      [districtId]: !prev[districtId],
    }));
  };

  // Flatten districts with parent division reference for quick filtering and lookup
  const allDistrictsWithDivision = useMemo(() => {
    const list: Array<{
      district: DistrictItem;
      division: DivisionItem;
    }> = [];

    divisions.forEach((division) => {
      division.districts.forEach((district) => {
        list.push({ district, division });
      });
    });

    return list;
  }, [divisions]);

  // Handle Search Filtering
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const matchedDistricts: Array<{
      district: DistrictItem;
      division: DivisionItem;
    }> = [];

    const matchedCityAreas: Array<{
      cityArea: AreaItem;
      district: DistrictItem;
      division: DivisionItem;
    }> = [];

    const matchedUpazilas: Array<{
      upazila: AreaItem;
      district: DistrictItem;
      division: DivisionItem;
    }> = [];

    allDistrictsWithDivision.forEach(({ district, division }) => {
      const distBn = district.title_bn?.toLowerCase() || "";
      const distEn = district.title_en?.toLowerCase() || "";
      const divBn = division.title_bn?.toLowerCase() || "";
      const divEn = division.title_en?.toLowerCase() || "";

      const districtMatches =
        distBn.includes(query) ||
        distEn.includes(query) ||
        divBn.includes(query) ||
        divEn.includes(query);

      if (districtMatches) {
        matchedDistricts.push({ district, division });
      }

      // Check City Areas
      district.city_areas?.forEach((cityArea) => {
        const caBn = cityArea.title_bn?.toLowerCase() || "";
        const caEn = cityArea.title_en?.toLowerCase() || "";

        if (caBn.includes(query) || caEn.includes(query)) {
          matchedCityAreas.push({ cityArea, district, division });
        }
      });

      // Check Upazilas
      district.upazilas.forEach((upazila) => {
        const upzBn = upazila.title_bn?.toLowerCase() || "";
        const upzEn = upazila.title_en?.toLowerCase() || "";

        if (upzBn.includes(query) || upzEn.includes(query)) {
          matchedUpazilas.push({ upazila, district, division });
        }
      });
    });

    return {
      districts: matchedDistricts,
      cityAreas: matchedCityAreas,
      upazilas: matchedUpazilas,
      totalCount: matchedDistricts.length + matchedCityAreas.length + matchedUpazilas.length,
    };
  }, [searchQuery, allDistrictsWithDivision]);

  // Handle Division Tab Filtering (when search is empty)
  const displayedDistricts = useMemo(() => {
    if (selectedDivisionId === "ALL") {
      return allDistrictsWithDivision;
    }
    return allDistrictsWithDivision.filter(
      (item) => item.division.id === selectedDivisionId
    );
  }, [selectedDivisionId, allDistrictsWithDivision]);

  return (
    <div className="space-y-8">
      {/* 1. Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              প্রশাসনিক বিভাগ
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {divisions.length}টি বিভাগ
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              সর্বমোট জেলা
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {totalDistricts}টি জেলা
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              সিটি এলাকা ও উপজেলা
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {totalUpazilas + totalCityAreas}টি এলাকা
            </span>
          </div>
        </div>

        <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              ইউনিয়ন কভারেজ
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {totalUnions.toLocaleString()}টি ইউনিয়ন
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Search & Quick Filter Bar */}
      <div className="p-5 sm:p-6 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <label
              htmlFor="location-search"
              className="text-sm font-bold text-slate-900 block"
            >
              জেলা, উপজেলা বা সিটি এলাকা দিয়ে খুঁজুন
            </label>
            <span className="text-xs text-slate-500">
              যেমন: মিরপুর, উত্তরা, ধানমন্ডি, গুলশান, বগুড়া, সিলেট, বা Savar
            </span>
          </div>
          {searchQuery && searchResults && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200">
              {searchResults.totalCount}টি ফলাফল পাওয়া গেছে
            </span>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="location-search"
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="যেমন: মিরপুর, উত্তরা, ধানমন্ডি, ঢাকা, বগুড়া, বা Dhamrai..."
            className="w-full pl-10 pr-20 py-3 rounded-lg border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-md transition-colors cursor-pointer"
                title="সার্চ মুছুন"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 border border-slate-200 rounded">
                /
              </kbd>
            )}
          </div>
        </div>
      </div>

      {/* 3. Search Results State OR Division Tabs Browsing State */}
      {searchQuery.trim() ? (
        /* Search Results View */
        <div className="space-y-6">
          {searchResults && searchResults.totalCount > 0 ? (
            <>
              {/* Matched City Areas Section */}
              {searchResults.cityAreas.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Compass className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      মিল পাওয়া মেট্রো সিটি এলাকাসমূহ ({searchResults.cityAreas.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {searchResults.cityAreas.map(({ cityArea, district, division }) => {
                      const districtSlug = toSlug(district.title_en || district.title_bn);
                      const cityAreaSlug = toSlug(cityArea.title_en || cityArea.title_bn);
                      return (
                        <Link
                          key={cityArea.id}
                          href={`/locations/${districtSlug}/${cityAreaSlug}`}
                          className="p-3.5 rounded-xl bg-white border border-emerald-200/90 hover:border-emerald-500 hover:bg-emerald-50/40 shadow-2xs transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                                সিটি এলাকা
                              </span>
                            </div>
                            <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 block">
                              {cityArea.title_bn}
                            </span>
                            {cityArea.title_en && (
                              <span className="text-xs text-slate-500 block">
                                {cityArea.title_en}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span>
                              {district.title_bn} ({division.title_bn})
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matched Districts Section */}
              {searchResults.districts.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Building2 className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      মিল পাওয়া জেলাসমূহ ({searchResults.districts.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.districts.map(({ district, division }) => (
                      <DistrictCard
                        key={district.id}
                        district={district}
                        divisionTitle={division.title_bn || division.title_en || ""}
                        isExpanded={!!expandedDistrictIds[district.id]}
                        onToggleExpand={() => toggleExpandDistrict(district.id)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Matched Upazilas Section */}
              {searchResults.upazilas.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                    <h3 className="text-sm sm:text-base font-bold text-slate-900">
                      মিল পাওয়া উপজেলাসমূহ ({searchResults.upazilas.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {searchResults.upazilas.map(({ upazila, district, division }) => {
                      const districtSlug = toSlug(district.title_en || district.title_bn);
                      const upazilaSlug = toSlug(upazila.title_en || upazila.title_bn);
                      return (
                        <Link
                          key={upazila.id}
                          href={`/locations/${districtSlug}/${upazilaSlug}`}
                          className="p-3.5 rounded-xl bg-white border border-slate-200/90 hover:border-emerald-500 hover:bg-slate-50/60 shadow-2xs transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 block">
                              {upazila.title_bn}
                            </span>
                            {upazila.title_en && (
                              <span className="text-xs text-slate-500 block">
                                {upazila.title_en}
                              </span>
                            )}
                          </div>
                          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                            <span>
                              {district.title_bn} ({division.title_bn})
                            </span>
                            <ArrowRight className="w-3 h-3 text-slate-400 group-hover:text-emerald-700 transition-transform group-hover:translate-x-0.5" />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="p-10 rounded-xl bg-white border border-slate-200 text-center space-y-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                &quot;{searchQuery}&quot; নামে কোনো এলাকা পাওয়া যায়নি
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                বানানটি যাচাই করুন অথবা নিচের বিভাগ ভিত্তিক তালিকা থেকে আপনার জেলা বা এলাকা নির্বাচন করুন।
              </p>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                সার্চ রিসেট করুন
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Default Division Tabs & Directory Grid */
        <div className="space-y-6">
          {/* Division Selector Tabs */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                বিভাগ নির্বাচন করুন
              </span>
              <span className="text-xs text-slate-500">
                {selectedDivisionId === "ALL"
                  ? `সকল বিভাগে মোট ${totalDistricts}টি জেলা`
                  : `নির্বাচিত বিভাগে ${displayedDistricts.length}টি জেলা`}
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setSelectedDivisionId("ALL")}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                  selectedDivisionId === "ALL"
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                }`}
              >
                <span>সকল বিভাগ</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded ${
                    selectedDivisionId === "ALL"
                      ? "bg-emerald-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {totalDistricts}
                </span>
              </button>

              {divisions.map((div) => {
                const isSelected = selectedDivisionId === div.id;
                return (
                  <button
                    key={div.id}
                    type="button"
                    onClick={() => setSelectedDivisionId(div.id)}
                    className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-2xs"
                        : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <span>{div.title_bn || div.title_en}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded ${
                        isSelected
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {div.districts.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* District Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedDistricts.map(({ district, division }) => (
              <DistrictCard
                key={district.id}
                district={district}
                divisionTitle={division.title_bn || division.title_en || ""}
                isExpanded={!!expandedDistrictIds[district.id]}
                onToggleExpand={() => toggleExpandDistrict(district.id)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-component: District Directory Card
function DistrictCard({
  district,
  divisionTitle,
  isExpanded,
  onToggleExpand,
}: {
  district: DistrictItem;
  divisionTitle: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}) {
  const districtSlug = toSlug(district.title_en || district.title_bn);
  const upazilaCount = district.upazilas?.length || 0;
  const cityAreaCount = district.city_areas?.length || 0;

  const previewLimit = 6;
  const displayedCityAreas = isExpanded
    ? district.city_areas || []
    : (district.city_areas || []).slice(0, previewLimit);

  const displayedUpazilas = isExpanded
    ? district.upazilas
    : district.upazilas.slice(0, previewLimit);

  return (
    <div className="p-4 sm:p-5 rounded-xl bg-white border border-slate-200/90 shadow-2xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-colors">
      {/* Top Details */}
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                {district.title_bn} জেলা
              </h4>
              {district.title_en && (
                <span className="text-xs text-slate-500 font-medium">
                  {district.title_en} District
                </span>
              )}
            </div>
          </div>
          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 shrink-0">
            {divisionTitle}
          </span>
        </div>

        {/* 1. If District has City Areas (e.g. Dhaka) */}
        {cityAreaCount > 0 && (
          <div className="space-y-1.5 p-3 rounded-lg bg-emerald-50/50 border border-emerald-100/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-700" />
                মেট্রো সিটি এলাকাসমূহ ({cityAreaCount})
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {displayedCityAreas.map((cityArea) => {
                const cityAreaSlug = toSlug(cityArea.title_en || cityArea.title_bn);
                return (
                  <Link
                    key={cityArea.id}
                    href={`/locations/${districtSlug}/${cityAreaSlug}`}
                    className="px-2.5 py-1 text-xs font-semibold rounded-md bg-white hover:bg-emerald-600 text-slate-800 hover:text-white border border-emerald-200/80 hover:border-emerald-600 transition-colors"
                  >
                    {cityArea.title_bn || cityArea.title_en}
                  </Link>
                );
              })}

              {cityAreaCount > previewLimit && (
                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="px-2 py-1 text-xs font-bold rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-800 transition-colors cursor-pointer flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <span>সংক্ষেপ করুন</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>+{cityAreaCount - previewLimit} আরও সিটি এলাকা</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 2. Upazilas */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span className="font-semibold text-slate-700 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              উপজেলা সমূহ ({upazilaCount})
            </span>
          </div>

          {upazilaCount > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {displayedUpazilas.map((upazila) => {
                const upazilaSlug = toSlug(upazila.title_en || upazila.title_bn);
                return (
                  <Link
                    key={upazila.id}
                    href={`/locations/${districtSlug}/${upazilaSlug}`}
                    className="px-2.5 py-1 text-xs font-medium rounded-md bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/70 hover:border-emerald-300 transition-colors"
                  >
                    {upazila.title_bn || upazila.title_en}
                  </Link>
                );
              })}

              {upazilaCount > previewLimit && (
                <button
                  type="button"
                  onClick={onToggleExpand}
                  className="px-2 py-1 text-xs font-bold rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center gap-1"
                >
                  {isExpanded ? (
                    <>
                      <span>সংক্ষেপ করুন</span>
                      <ChevronUp className="w-3 h-3" />
                    </>
                  ) : (
                    <>
                      <span>+{upazilaCount - previewLimit} আরও</span>
                      <ChevronDown className="w-3 h-3" />
                    </>
                  )}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">কোনো উপজেলা পাওয়া যায়নি</p>
          )}
        </div>
      </div>

      {/* Bottom Action Button */}
      <div className="pt-3 border-t border-slate-100">
        <Link
          href={`/locations/${districtSlug}`}
          className="w-full py-2.5 px-4 rounded-lg bg-slate-50 hover:bg-emerald-50 text-slate-800 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-300 font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>{district.title_bn} জেলার সকল এলাকা ও শ্রমজীবী দেখুন</span>
          <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
        </Link>
      </div>
    </div>
  );
}
