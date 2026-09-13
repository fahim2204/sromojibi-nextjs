"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Search, X, Users, ChevronRight, Briefcase } from "lucide-react";
import type { ApiCategory } from "@/services/categoryService";

interface CategoryExplorerProps {
  categories: ApiCategory[];
}

export default function CategoryExplorer({ categories }: CategoryExplorerProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;

    return categories.filter((cat) => {
      const matchName = cat.name.toLowerCase().includes(q);
      const matchNameBn = cat.name_bn ? cat.name_bn.toLowerCase().includes(q) : false;
      const matchSlug = cat.slug.toLowerCase().includes(q);
      const matchDesc = cat.description ? cat.description.toLowerCase().includes(q) : false;
      return matchName || matchNameBn || matchSlug || matchDesc;
    });
  }, [categories, searchQuery]);

  return (
    <div className="space-y-5">
      {/* Search & Meta Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ক্যাটাগরি বা কাজের ধরন দিয়ে খুঁজুন (যেমন: দিনমজুর, ভ্যান চালক, ইলেকট্রিশিয়ান, লেবার)..."
            className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200 transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs text-slate-500 px-1">
          <span>
            দেখানো হচ্ছে <strong className="text-slate-900 font-semibold">{filteredCategories.length}</strong> / {categories.length} টি ক্যাটাগরি
          </span>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-emerald-700 hover:underline text-xs font-semibold ml-1"
            >
              রিসেট
            </button>
          )}
        </div>
      </div>

      {/* Categories Grid */}
      {filteredCategories.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredCategories.map((cat) => {
            const workerCount = cat._count?.workers ?? 0;

            return (
              <Link
                key={cat.slug}
                href={`/categories/${cat.slug}`}
                className="group flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4 hover:border-emerald-600 hover:shadow-xs transition-all"
              >
                <div>
                  {/* Top row: Icon & Worker Count Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-xl shrink-0 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-colors">
                      {cat.icon || "🛠️"}
                    </div>

                    {workerCount > 0 && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border shrink-0 bg-emerald-50 text-emerald-800 border-emerald-200/70">
                        <Users className="w-3 h-3 text-emerald-700" />
                        <span>{workerCount} জন কর্মী</span>
                      </span>
                    )}
                  </div>

                  {/* Title & English Subtitle */}
                  <div className="mt-3">
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
                      {cat.name_bn || cat.name}
                    </h2>
                    <p className="text-[11px] font-medium text-slate-400 mt-0.5">
                      {cat.name}
                    </p>
                  </div>

                  {/* Description */}
                  {cat.description && (
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span>কর্মী তালিকা দেখুন</span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-12 px-4 bg-white rounded-xl border border-slate-200">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
            <Briefcase className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">কোনো ক্যাটাগরি মেলেনি</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            &quot;{searchQuery}&quot; দিয়ে কোনো ক্যাটাগরি খুঁজে পাওয়া যায়নি। বানান ঠিক আছে কি না যাচাই করুন।
          </p>
          <button
            onClick={() => setSearchQuery("")}
            className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            অনুসন্ধান মুছুন
          </button>
        </div>
      )}
    </div>
  );
}
