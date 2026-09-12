import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import AdminWorkerTable from "@/components/AdminWorkerTable";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin Worker Verification Dashboard | Sromojibi",
  description: "Review, approve, reject, and manage worker profile registrations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminWorkersPage() {
  const rawWorkers = await prisma.workerProfile.findMany({
    orderBy: { created_at: "desc" },
    include: {
      workerCategories: {
        select: {
          category: { select: { icon: true, name: true } },
        },
      },
      divisionRef: { select: { title_en: true, title_bn: true } },
      districtRef: { select: { title_en: true, title_bn: true } },
    },
  });

  const allWorkers = rawWorkers.map((w) => {
    const cats = w.workerCategories.map((wc) => wc.category);
    return {
      ...w,
      city: w.divisionRef?.title_en || w.divisionRef?.title_bn || "Bangladesh",
      experience: `${w.experience} ${w.experience > 1 ? "Years" : "Year"}`,
      category: cats[0] ?? null,
      service_type: cats.map((c) => c.name).join(", "),
    };
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              Sromojibi Admin Panel
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
              Worker Profile Verification
            </h1>
            <p className="text-sm text-gray-600">
              Review incoming worker registrations and manage active directory listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workers"
              className="px-4 py-2.5 rounded-xl bg-white border border-gray-200 hover:border-emerald-500/40 text-xs font-bold text-gray-700 hover:text-emerald-600 transition-all shadow-sm"
            >
              🌐 View Public Directory →
            </Link>
          </div>
        </div>

        <AdminWorkerTable initialWorkers={allWorkers} />
      </div>
    </main>
  );
}
