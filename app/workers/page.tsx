import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workers Directory - Discover Local Mistris & Technicians",
  description:
    "Explore Bangladesh's worker directory. Discover electricians, plumbers, tiles mistri, rajmistri, painters and local technicians near you.",
  alternates: {
    canonical: "/workers",
  },
};

export default function WorkersDirectoryPage() {
  const categories = [
    { name: "Electrician", icon: "⚡", slug: "electrician", count: "Directory Listing" },
    { name: "Plumber", icon: "🚰", slug: "plumber", count: "Directory Listing" },
    { name: "Rajmistri", icon: "🏠", slug: "rajmistri", count: "Directory Listing" },
    { name: "Tiles Worker", icon: "🧱", slug: "tiles-worker", count: "Directory Listing" },
    { name: "Painter", icon: "🎨", slug: "painter", count: "Directory Listing" },
    { name: "Carpenter", icon: "🔨", slug: "carpenter", count: "Directory Listing" },
    { name: "AC Technician", icon: "❄️", slug: "ac-technician", count: "Directory Listing" },
    { name: "CCTV Installer", icon: "📹", slug: "cctv-installer", count: "Directory Listing" },
  ];

  const locations = [
    { name: "Dhaka", slug: "dhaka", desc: "Capital Division & Metropolitan Area" },
    { name: "Mymensingh", slug: "mymensingh", desc: "Mymensingh Division & Districts" },
    { name: "Chittagong", slug: "chittagong", desc: "Chittagong Division & Coastal Belt" },
    { name: "Sylhet", slug: "sylhet", desc: "Sylhet Division & Surrounding Districts" },
    { name: "Rajshahi", slug: "rajshahi", desc: "Rajshahi Division & Northern Region" },
    { name: "Khulna", slug: "khulna", desc: "Khulna Division & Southwestern Region" },
  ];

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
            Sromojibi helps customers discover electrician, plumber, rajmistri, and tiles mistri profiles across Bangladesh.
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
                <div className="text-3xl shrink-0 group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-gray-400">{cat.count}</p>
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
                <p className="text-xs text-gray-400">{loc.desc}</p>
                <div className="text-xs font-semibold text-emerald-400 pt-1 group-hover:translate-x-1 transition-transform">
                  View {loc.name} Listings →
                </div>
              </Link>
            ))}
          </div>
        </div>

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
