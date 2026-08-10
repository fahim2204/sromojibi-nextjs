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
  const allWorkers = await prisma.workerProfile.findMany({
    orderBy: { created_at: "desc" },
    include: {
      category: { select: { icon: true, name: true } },
    },
  });

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
          <div className="space-y-2">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              Sromojibi Admin Panel
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">
              Worker Profile Verification
            </h1>
            <p className="text-sm text-gray-400">
              Review incoming worker registrations and manage active directory listings.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/workers"
              className="px-4 py-2.5 rounded-xl bg-gray-900 border border-gray-800 hover:border-emerald-500/40 text-xs font-bold text-gray-300 hover:text-emerald-400 transition-all"
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
