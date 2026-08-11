import { Metadata } from "next";
import Link from "next/link";
import AddressHierarchyExplorer from "./AddressHierarchyExplorer";

export const metadata: Metadata = {
  title: "Bangladesh Location Directory - Sromojibi Worker Network",
  description:
    "Browse complete Bangladesh address hierarchy including 8 Divisions, 64 Districts (Zilla), 509 Upazilas, and 4,536 Unions with official government portal links and worker listings.",
  alternates: {
    canonical: "/locations",
  },
};

export default function LocationsPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200 text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Bangladesh Geographic Coverage
          </div>
          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900">
            Address Directory & Coverage
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Explore complete Bangladesh administrative divisions, zillas, upazilas, and unions connected directly with local worker directory networks.
          </p>
        </div>

        {/* Interactive Location Hierarchy Explorer */}
        <AddressHierarchyExplorer />

        {/* Footer Navigation */}
        <div className="text-center pt-8 border-t border-slate-200">
          <Link
            href="/workers"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600 transition"
          >
            <span>← Back to All Workers Directory</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
