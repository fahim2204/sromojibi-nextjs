"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Input, Select, SelectItem, Button } from "@nextui-org/react";
import {
  Search,
  RotateCcw,
  CheckCircle2,
  MapPin,
  Briefcase,
  Award,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  UserCheck,
} from "lucide-react";

export type WorkerItem = {
  id: number;
  full_name: string;
  slug: string;
  service_type: string;
  city: string;
  zilla?: string | null;
  upazila?: string | null;
  coverage_scope?: string | null;
  experience: number | string;
  details?: string | null;
  is_verified: boolean;
  rating?: number | any;
  review_count: number;
  category?: { icon?: string | null; name: string } | null;
  categories?: { icon?: string | null; name: string; name_bn?: string | null }[];
};

export type CategoryItem = {
  id: number;
  name: string;
  name_bn?: string | null;
  slug: string;
  icon?: string | null;
};

export type LocationItem = {
  id: string | number;
  name: string;
  name_bn?: string | null;
  slug?: string;
};

type Props = {
  initialWorkers: WorkerItem[];
  categories: CategoryItem[];
  locations: LocationItem[];
  pageSize?: number;
};

export default function WorkerSearchFilter({
  initialWorkers,
  categories,
  locations,
  pageSize = 6,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const resultsRef = useRef<HTMLDivElement>(null);

  const categoryOptions = useMemo(() => {
    return [
      { key: "ALL", label: "সকল সার্ভিস ক্যাটাগরি (All Categories)" },
      ...categories.map((c) => ({
        key: c.name,
        label: c.name_bn ? `${c.name_bn} (${c.name})` : c.name,
      })),
    ];
  }, [categories]);

  const locationOptions = useMemo(() => {
    return [
      { key: "ALL", label: "সকল এলাকা / জেলা (All Locations)" },
      ...locations.map((l) => ({
        key: l.name,
        label: l.name_bn ? `${l.name_bn} (${l.name})` : l.name,
      })),
    ];
  }, [locations]);

  // Filter workers based on query, category, and city
  const filteredWorkers = useMemo(() => {
    return initialWorkers.filter((worker) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        worker.full_name.toLowerCase().includes(q) ||
        worker.service_type.toLowerCase().includes(q) ||
        worker.city.toLowerCase().includes(q) ||
        (worker.zilla && worker.zilla.toLowerCase().includes(q)) ||
        (worker.upazila && worker.upazila.toLowerCase().includes(q)) ||
        (worker.details && worker.details.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "ALL" ||
        worker.service_type.toLowerCase().includes(selectedCategory.toLowerCase()) ||
        worker.category?.name.toLowerCase() === selectedCategory.toLowerCase() ||
        (worker.categories &&
          worker.categories.some(
            (c) => c.name.toLowerCase() === selectedCategory.toLowerCase()
          ));

      const matchesCity =
        selectedCity === "ALL" ||
        worker.city.toLowerCase().includes(selectedCity.toLowerCase()) ||
        (worker.zilla && worker.zilla.toLowerCase().includes(selectedCity.toLowerCase()));

      return matchesQuery && matchesCategory && matchesCity;
    });
  }, [initialWorkers, searchQuery, selectedCategory, selectedCity]);

  // Reset to page 1 whenever search filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedCity]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredWorkers.length / pageSize) || 1;

  const paginatedWorkers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredWorkers.slice(start, start + pageSize);
  }, [filteredWorkers, currentPage, pageSize]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedCity("ALL");
    setCurrentPage(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredWorkers.length);

  return (
    <div className="space-y-8" ref={resultsRef}>
      {/* Search & Filter Bar Container */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-emerald-600" />
            <span>ফিল্টার ও সার্চ করুন (Find Workers)</span>
          </h2>
          {(searchQuery || selectedCategory !== "ALL" || selectedCity !== "ALL") && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট করুন</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            isClearable
            type="text"
            placeholder="নাম, কাজের ধরণ বা দক্ষতা দিয়ে খুঁজুন..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            startContent={<Search className="w-4 h-4 text-slate-400 shrink-0" />}
            classNames={{
              input: "text-slate-900 text-sm placeholder:text-slate-400",
              inputWrapper:
                "border border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-600 bg-white rounded-lg shadow-sm h-11",
            }}
          />

          <Select
            aria-label="Filter by Service Category"
            selectedKeys={new Set([selectedCategory])}
            disallowEmptySelection
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;
              if (val) setSelectedCategory(val);
            }}
            classNames={{
              value: "text-slate-900 text-sm",
              trigger:
                "border border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-600 bg-white rounded-lg shadow-sm cursor-pointer h-11",
              popoverContent: "bg-white border border-slate-200 text-slate-900 shadow-lg z-50",
            }}
          >
            {categoryOptions.map((opt) => (
              <SelectItem
                key={opt.key}
                textValue={opt.label}
                className="text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer text-sm"
              >
                {opt.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            aria-label="Filter by Location"
            selectedKeys={new Set([selectedCity])}
            disallowEmptySelection
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;
              if (val) setSelectedCity(val);
            }}
            classNames={{
              value: "text-slate-900 text-sm",
              trigger:
                "border border-slate-200 hover:border-emerald-500 focus-within:!border-emerald-600 bg-white rounded-lg shadow-sm cursor-pointer h-11",
              popoverContent: "bg-white border border-slate-200 text-slate-900 shadow-lg z-50",
            }}
          >
            {locationOptions.map((opt) => (
              <SelectItem
                key={opt.key}
                textValue={opt.label}
                className="text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 cursor-pointer text-sm"
              >
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Filter Results & Worker Cards Section */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-emerald-600" />
              <span>তালিকাভুক্ত মিস্ত্রি ও কারিগর ({filteredWorkers.length})</span>
            </h3>
          </div>
          <span className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-medium">
            {filteredWorkers.length === 0
              ? "০ জন কারিগর"
              : `দেখাচ্ছে ${startIndex + 1}–${endIndex} (মোট ${filteredWorkers.length} জন)`}
          </span>
        </div>

        {paginatedWorkers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedWorkers.map((worker) => (
              <div
                key={worker.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-500/60 hover:shadow-md transition-all space-y-4 flex flex-col justify-between shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Link
                          href={`/workers/${worker.slug}`}
                          className="font-bold text-slate-900 text-base sm:text-lg hover:text-emerald-600 transition-colors"
                        >
                          {worker.full_name}
                        </Link>
                        {worker.is_verified && (
                          <span
                            className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold"
                            title="Verified Worker"
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            ভেরিফাইড
                          </span>
                        )}
                      </div>

                      <div className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span className="line-clamp-1">{worker.service_type}</span>
                      </div>

                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                        <span className="line-clamp-1">
                          {worker.upazila ? `${worker.upazila}, ` : ""}
                          {worker.zilla || worker.city}
                        </span>
                      </div>

                      {worker.coverage_scope === "ALL_DISTRICT" && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200/60">
                          <MapPin className="w-3 h-3 text-blue-500" />
                          পুরো জেলা সার্ভিস
                        </span>
                      )}
                      {worker.coverage_scope === "ALL_UPAZILA" && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200/60">
                          <MapPin className="w-3 h-3 text-emerald-500" />
                          পুরো উপজেলা সার্ভিস
                        </span>
                      )}
                    </div>

                    <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold shrink-0 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{worker.experience} বছর</span>
                    </span>
                  </div>

                  {worker.details && (
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {worker.details}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    href={`/workers/${worker.slug}`}
                    className="w-full text-xs text-center py-2.5 px-4 rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200/80 hover:border-emerald-300 font-bold inline-flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                  >
                    <span>প্রোফাইল ও যোগাযোগ দেখুন</span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-2xl bg-white border border-slate-200 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-bold text-slate-900">
                কোনো মিস্ত্রি পাওয়া যায়নি
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                আপনার সার্চ কি-ওয়ার্ড বা ফিল্টার অপশন পরিবর্তন করে পুনরায় চেষ্টা করুন।
              </p>
            </div>
            <Button
              size="sm"
              onClick={handleReset}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-lg inline-flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ফিল্টার রিসেট করুন</span>
            </Button>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <div className="text-xs text-slate-500 font-medium">
              পৃষ্ঠা <span className="font-bold text-slate-800">{currentPage}</span> /{" "}
              <span className="font-bold text-slate-800">{totalPages}</span> (মোট{" "}
              {filteredWorkers.length} জন)
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="bordered"
                isDisabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
                className="text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 rounded-lg h-8 px-3"
              >
                <ChevronLeft className="w-3.5 h-3.5 mr-1" />
                <span>পূর্ববর্তী</span>
              </Button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                      currentPage === pageNum
                        ? "bg-emerald-600 text-white border border-emerald-600 shadow-xs"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>

              <Button
                size="sm"
                variant="bordered"
                isDisabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
                className="text-xs font-medium border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 rounded-lg h-8 px-3"
              >
                <span>পরবর্তী</span>
                <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
