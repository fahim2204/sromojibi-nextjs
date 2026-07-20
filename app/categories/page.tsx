import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Service Categories - Sromojibi Worker Directory",
  description:
    "Explore worker service categories including Rajmistri, Electrician, Plumber, Tiles Worker, Painter, Carpenter, AC Technician, and CCTV Installer in Bangladesh.",
  alternates: {
    canonical: "/categories",
  },
};

export default function CategoriesPage() {
  const categories = [
    {
      name: "Rajmistri",
      icon: "🏠",
      slug: "rajmistri",
      description: "Masonry, bricklaying, foundation work, roof slabs, and civil structural work.",
      popular: true,
    },
    {
      name: "Electrician",
      icon: "⚡",
      slug: "electrician",
      description: "House wiring, circuit breaker maintenance, light fittings, and electrical troubleshooting.",
      popular: true,
    },
    {
      name: "Plumber",
      icon: "🚰",
      slug: "plumber",
      description: "Pipe fitting, water pump installation, bathroom sanitary fittings, and leak repairs.",
      popular: true,
    },
    {
      name: "Tiles Worker",
      icon: "🧱",
      slug: "tiles-worker",
      description: "Floor tiles, marble polishing, kitchen wall tiling, and bathroom tile fitting.",
      popular: true,
    },
    {
      name: "Painter",
      icon: "🎨",
      slug: "painter",
      description: "Wall putty, interior & exterior acrylic painting, texture paint, and wood polish.",
      popular: true,
    },
    {
      name: "Carpenter",
      icon: "🔨",
      slug: "carpenter",
      description: "Door fitting, window frames, custom cabinet woodwork, and furniture repair mistris.",
      popular: true,
    },
    {
      name: "AC Technician",
      icon: "❄️",
      slug: "ac-technician",
      description: "Split & window AC installation, master cleaning, gas refilling, and compressor repairs.",
      popular: true,
    },
    {
      name: "CCTV Installer",
      icon: "📹",
      slug: "cctv-installer",
      description: "IP camera setup, DVR/NVR configuration, security system wiring, and maintenance.",
      popular: true,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Directory Categories
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">Popular Worker Categories</h1>
          <p className="text-gray-400 text-base md:text-lg">
            Discover Bangladesh&apos;s skilled mistris and trade technicians organized by service trade.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.slug}
              className="p-6 rounded-3xl bg-gray-900 border border-gray-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="text-4xl group-hover:scale-110 transition-transform">{cat.icon}</div>
                <h2 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {cat.name}
                </h2>
                <p className="text-sm text-gray-400 leading-relaxed">{cat.description}</p>
              </div>

              <div className="pt-2 border-t border-gray-800/80">
                <Link
                  href={`/workers/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <span>Discover {cat.name} Listings</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center pt-6">
          <Link href="/workers" className="text-sm font-semibold text-gray-400 hover:text-emerald-400">
            ← Back to All Workers Directory
          </Link>
        </div>
      </div>
    </main>
  );
}
