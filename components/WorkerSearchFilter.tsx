"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Input, Select, SelectItem, Button } from "@nextui-org/react";

type WorkerItem = {
  id: number;
  full_name: string;
  phone: string;
  slug: string;
  service_type: string;
  city: string;
  experience: string;
  details?: string | null;
  is_verified: boolean;
  rating?: number | any;
  review_count: number;
  category?: { icon?: string | null; name: string } | null;
  location?: { name: string } | null;
};

type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  icon?: string | null;
};

type LocationItem = {
  id: number;
  name: string;
  slug: string;
};

type Props = {
  initialWorkers: WorkerItem[];
  categories: CategoryItem[];
  locations: LocationItem[];
};

export default function WorkerSearchFilter({
  initialWorkers,
  categories,
  locations,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [selectedCity, setSelectedCity] = useState<string>("ALL");

  const categoryOptions = useMemo(() => {
    return [
      { key: "ALL", label: "⚡ All Service Categories" },
      ...categories.map((c) => ({
        key: c.name,
        label: `${c.icon ?? "🛠️"} ${c.name}`,
      })),
    ];
  }, [categories]);

  const locationOptions = useMemo(() => {
    return [
      { key: "ALL", label: "🏙️ All Launch Cities" },
      ...locations.map((l) => ({
        key: l.name,
        label: l.name,
      })),
    ];
  }, [locations]);

  const filteredWorkers = useMemo(() => {
    return initialWorkers.filter((worker) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        worker.full_name.toLowerCase().includes(q) ||
        worker.service_type.toLowerCase().includes(q) ||
        worker.city.toLowerCase().includes(q) ||
        (worker.details && worker.details.toLowerCase().includes(q));

      const matchesCategory =
        selectedCategory === "ALL" ||
        worker.service_type.toLowerCase() === selectedCategory.toLowerCase() ||
        worker.category?.name.toLowerCase() === selectedCategory.toLowerCase();

      const matchesCity =
        selectedCity === "ALL" ||
        worker.city.toLowerCase() === selectedCity.toLowerCase();

      return matchesQuery && matchesCategory && matchesCity;
    });
  }, [initialWorkers, searchQuery, selectedCategory, selectedCity]);

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory("ALL");
    setSelectedCity("ALL");
  };

  return (
    <div className="space-y-8">
      {/* Search & Filter Bar Container */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span>🔍</span> Find & Filter Local Mistris
          </h2>
          {(searchQuery || selectedCategory !== "ALL" || selectedCity !== "ALL") && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-emerald-600 hover:underline cursor-pointer"
            >
              Reset Filters ↺
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            isClearable
            type="text"
            placeholder="Search by name, trade, or skill..."
            value={searchQuery}
            onValueChange={setSearchQuery}
            onClear={() => setSearchQuery("")}
            classNames={{
              input: "text-gray-900 text-sm placeholder:text-gray-400",
              inputWrapper:
                "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm",
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
              value: "text-gray-900 text-sm",
              trigger:
                "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm cursor-pointer",
              popoverContent: "bg-white border border-gray-200 text-gray-900 shadow-md z-50",
            }}
          >
            {categoryOptions.map((opt) => (
              <SelectItem
                key={opt.key}
                textValue={opt.label}
                className="text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
              >
                {opt.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            aria-label="Filter by Launch City"
            selectedKeys={new Set([selectedCity])}
            disallowEmptySelection
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;
              if (val) setSelectedCity(val);
            }}
            classNames={{
              value: "text-gray-900 text-sm",
              trigger:
                "border-gray-300 hover:border-emerald-500 focus-within:!border-emerald-500 bg-white rounded-xl shadow-sm cursor-pointer",
              popoverContent: "bg-white border border-gray-200 text-gray-900 shadow-md z-50",
            }}
          >
            {locationOptions.map((opt) => (
              <SelectItem
                key={opt.key}
                textValue={opt.label}
                className="text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer"
              >
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Filter Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <h3 className="text-xl font-bold text-gray-900">
            Available Worker Profiles ({filteredWorkers.length})
          </h3>
          <span className="text-xs text-emerald-600 font-semibold">
            {filteredWorkers.length === initialWorkers.length
              ? "Showing All Profiles"
              : `Filtered ${filteredWorkers.length} of ${initialWorkers.length}`}
          </span>
        </div>

        {filteredWorkers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredWorkers.map((worker) => (
              <div
                key={worker.id}
                className="p-6 rounded-2xl bg-white border border-gray-200 hover:border-emerald-500/40 hover:shadow-md transition-all space-y-4 flex flex-col justify-between shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/workers/${worker.slug}`} className="group flex items-center gap-1.5">
                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-emerald-600 transition-colors">
                          {worker.full_name}
                        </h4>
                        {worker.is_verified && (
                          <span className="text-emerald-600 text-xs font-bold" title="Verified Worker">
                            ✓
                          </span>
                        )}
                      </Link>
                      <p className="text-xs text-emerald-700 font-medium">
                        {worker.category?.icon ?? "🛠️"} {worker.service_type} • {worker.city}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold shrink-0">
                      {worker.experience}
                    </span>
                  </div>

                  {worker.details && (
                    <p className="text-xs text-gray-500 line-clamp-3">
                      {worker.details}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                  <Link
                    href={`/workers/${worker.slug}`}
                    className="text-xs text-emerald-600 hover:underline font-bold"
                  >
                    প্রোফাইল দেখুন →
                  </Link>
                  <a
                    href={`tel:${worker.phone}`}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs transition-all shadow-sm shrink-0"
                  >
                    📞 Call Mistri
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-white border border-gray-200 text-center space-y-4 shadow-sm">
            <div className="text-4xl">🔍</div>
            <h4 className="text-lg font-bold text-gray-900">No Matching Workers Found</h4>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Try adjusting your search keywords, category selection, or city filter.
            </p>
            <Button
              onClick={handleReset}
              className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl"
            >
              Reset All Search Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
