import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerSearchFilter from "@/components/WorkerSearchFilter";

export const revalidate = 60; // Revalidate static data every 60 seconds

export const metadata: Metadata = {
  title: "Workers Directory - Discover Local Mistris & Technicians",
  description:
    "Explore Bangladesh's worker directory. Discover electricians, plumbers, tiles mistri, rajmistri, painters and local technicians near you.",
  alternates: {
    canonical: "/workers",
  },
};

export default async function WorkersDirectoryPage() {
  // Fetch active categories with worker count from DB
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { workers: true },
      },
    },
  });

  // Fetch active locations with worker count from DB
  const locations = await prisma.location.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { workers: true },
      },
    },
  });

  // Fetch all approved worker profiles for live client-side searching & filtering
  const allApprovedWorkers = await prisma.workerProfile.findMany({
    where: { status: "APPROVED" },
    orderBy: { created_at: "desc" },
    include: {
      category: { select: { icon: true, name: true } },
      location: { select: { name: true } },
    },
  });

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Worker Directory
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">
            Discover Skilled Local Workers
          </h1>
          <p className="text-gray-400 text-base md:text-lg">
            Sromojibi connects house owners with electricians, plumbers, rajmistris, and technicians across Bangladesh.
          </p>
        </div>

        {/* Directory Categories Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-2xl font-bold text-white">Browse by Worker Category</h2>
            <Link href="/categories" className="text-xs font-semibold text-emerald-400 hover:underline">
              All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/workers/${cat.slug}`}
                className="p-5 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/50 hover:bg-gray-800/80 transition-all flex items-center gap-4 group"
              >
                <div className="text-3xl shrink-0 group-hover:scale-110 transition-transform">
                  {cat.icon ?? "🛠️"}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {cat._count.workers > 0
                      ? `${cat._count.workers} Listed Worker${cat._count.workers > 1 ? "s" : ""}`
                      : "Directory Listing"}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Locations Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h2 className="text-2xl font-bold text-white">Browse by Launch Cities</h2>
            <Link href="/locations" className="text-xs font-semibold text-emerald-400 hover:underline">
              All Locations →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {locations.map((loc) => (
              <Link
                key={loc.slug}
                href={`/workers/${loc.slug}`}
                className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/50 transition-all space-y-2 group"
              >
                <div className="text-2xl">🏙️</div>
                <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">
                  {loc.name} Workers
                </h3>
                <p className="text-xs text-gray-400">{loc.description ?? `${loc.name} Division`}</p>
                <div className="text-xs font-semibold text-emerald-400 pt-1 group-hover:translate-x-1 transition-transform">
                  View {loc._count.workers > 0 ? `${loc._count.workers} ` : ""}{loc.name} Listings →
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Live Search & Filterable Worker Showcase */}
        <WorkerSearchFilter
          initialWorkers={allApprovedWorkers}
          categories={categories}
          locations={locations}
        />

        {/* Worker CTA Banner */}
        <div className="p-8 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-gray-900 to-teal-950/40 border border-emerald-500/30 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Are you a skilled worker?</h3>
            <p className="text-sm text-gray-300">
              Create your free profile today and help customers find your services online.
            </p>
          </div>
          <Link
            href="/join-worker"
            className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm shrink-0 transition-all"
          >
            Register Free Profile
          </Link>
        </div>
      </div>
    </main>
  );
}
