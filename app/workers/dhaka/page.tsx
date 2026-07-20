import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dhaka Workers Directory - Electricians, Plumbers & Mistris in Dhaka",
  description:
    "Find trusted local workers in Dhaka including electricians, plumbers, tiles mistri, rajmistri, painters and technicians across Dhaka Division.",
  alternates: {
    canonical: "/workers/dhaka",
  },
};

export default function DhakaWorkersPage() {
  const categories = [
    { name: "Electrician in Dhaka", icon: "⚡", slug: "electrician" },
    { name: "Plumber in Dhaka", icon: "🚰", slug: "plumber" },
    { name: "Rajmistri in Dhaka", icon: "🏠", slug: "rajmistri" },
    { name: "Tiles Worker in Dhaka", icon: "🧱", slug: "tiles-worker" },
    { name: "Painter in Dhaka", icon: "🎨", slug: "painter" },
    { name: "Carpenter in Dhaka", icon: "🔨", slug: "carpenter" },
    { name: "AC Technician in Dhaka", icon: "❄️", slug: "ac-technician" },
    { name: "CCTV Installer in Dhaka", icon: "📹", slug: "cctv-installer" },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Link href="/workers" className="hover:underline">Workers</Link>
            <span>/</span>
            <span>Dhaka</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white">
            Find Skilled Local Workers in <span className="text-emerald-400">Dhaka</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-3xl">
            Sromojibi is building Dhaka&apos;s largest directory for electricians, plumbers, rajmistris, tiles workers, and home service technicians across Mirpur, Uttara, Dhanmondi, Gulshan, Mohammadpur, and Gazipur.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-3">
            Popular Worker Categories in Dhaka
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <div
                key={cat.slug}
                className="p-4 rounded-2xl bg-gray-950 border border-gray-800 flex items-center gap-3 hover:border-emerald-500/50 transition-all"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-bold text-gray-200">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Are you a worker based in Dhaka?</h3>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Create your free profile today to reach local customers searching for mistris in your neighborhood.
          </p>
          <div>
            <Link
              href="/join-worker"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all"
            >
              Register Free Profile in Dhaka
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
