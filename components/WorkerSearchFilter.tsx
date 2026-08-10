"use client";

import React, { useState, useMemo } from "react";
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
      <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4 shadow-xl shadow-black/40">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <span>🔍</span> Find & Filter Local Mistris
          </h2>
          {(searchQuery || selectedCategory !== "ALL" || selectedCity !== "ALL") && (
            <button
              onClick={handleReset}
              className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
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
              input: "text-white text-sm placeholder:text-gray-500",
              inputWrapper:
                "border-gray-800 hover:border-emerald-500 focus-within:!border-emerald-500 bg-gray-950/80 rounded-xl",
            }}
          />

          <Select
            aria-label="Filter by Service Category"
            selectedKeys={[selectedCategory]}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;
              if (val) setSelectedCategory(val);
            }}
            classNames={{
              value: "text-white text-sm",
              trigger:
                "border-gray-800 hover:border-emerald-500 focus-within:!border-emerald-500 bg-gray-950/80 rounded-xl",
              popoverContent: "bg-gray-900 border border-gray-800 text-white",
            }}
          >
            {categoryOptions.map((opt) => (
              <SelectItem
                key={opt.key}
                className="text-gray-200 hover:bg-gray-800 hover:text-emerald-400"
              >
                {opt.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            aria-label="Filter by Launch City"
            selectedKeys={[selectedCity]}
            onSelectionChange={(keys) => {
              const val = Array.from(keys)[0] as string;
              if (val) setSelectedCity(val);
            }}
            classNames={{
              value: "text-white text-sm",
              trigger:
                "border-gray-800 hover:border-emerald-500 focus-within:!border-emerald-500 bg-gray-950/80 rounded-xl",
              popoverContent: "bg-gray-900 border border-gray-800 text-white",
            }}
          >
            {locationOptions.map((opt) => (
              <SelectItem
                key={opt.key}
                className="text-gray-200 hover:bg-gray-800 hover:text-emerald-400"
              >
                {opt.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </div>

      {/* Filter Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-800 pb-3">
          <h3 className="text-xl font-bold text-white">
            Available Worker Profiles ({filteredWorkers.length})
          </h3>
          <span className="text-xs text-emerald-400 font-semibold">
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
                className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-white text-lg">{worker.full_name}</h4>
                        {worker.is_verified && (
                          <span className="text-emerald-400 text-xs" title="Verified Worker">
                            ✓
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-400 font-medium">
                        {worker.category?.icon ?? "🛠️"} {worker.service_type} • {worker.city}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-semibold shrink-0">
                      {worker.experience}
                    </span>
                  </div>

                  {worker.details && (
                    <p className="text-xs text-gray-400 line-clamp-3">
                      {worker.details}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-yellow-400 font-bold">
                    ★ {Number(worker.rating ?? 5.0).toFixed(1)} ({worker.review_count} reviews)
                  </span>
                  <a
                    href={`tel:${worker.phone}`}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold text-xs transition-all"
                  >
                    📞 Call Mistri
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 rounded-3xl bg-gray-900 border border-gray-800 text-center space-y-4">
            <div className="text-4xl">🔍</div>
            <h4 className="text-lg font-bold text-white">No Matching Workers Found</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Try adjusting your search keywords, category selection, or city filter.
            </p>
            <Button
              onClick={handleReset}
              className="bg-gray-800 hover:bg-gray-700 text-white font-semibold text-xs rounded-xl"
            >
              Reset All Search Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
