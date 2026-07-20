import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mymensingh Workers Directory - Electricians, Plumbers & Mistris in Mymensingh",
  description:
    "Find trusted local workers in Mymensingh including electricians, plumbers, tiles mistri, rajmistri, painters and home service professionals.",
  alternates: {
    canonical: "/workers/mymensingh",
  },
};

export default function MymensinghWorkersPage() {
  const categories = [
    { name: "Electrician in Mymensingh", icon: "⚡", slug: "electrician" },
    { name: "Plumber in Mymensingh", icon: "🚰", slug: "plumber" },
    { name: "Rajmistri in Mymensingh", icon: "🏠", slug: "rajmistri" },
    { name: "Tiles Worker in Mymensingh", icon: "🧱", slug: "tiles-worker" },
    { name: "Painter in Mymensingh", icon: "🎨", slug: "painter" },
    { name: "Carpenter in Mymensingh", icon: "🔨", slug: "carpenter" },
    { name: "AC Technician in Mymensingh", icon: "❄️", slug: "ac-technician" },
    { name: "CCTV Installer in Mymensingh", icon: "📹", slug: "cctv-installer" },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Link href="/workers" className="hover:underline">Workers</Link>
            <span>/</span>
            <span>Mymensingh</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white">
            Find Skilled Local Workers in <span className="text-emerald-400">Mymensingh</span>
          </h1>
          <p className="text-gray-300 text-base md:text-lg max-w-3xl">
            Sromojibi is building Mymensingh&apos;s primary worker directory across Sadar, Jamalpur, Sherpur, and Netrokona. Discover experienced local technicians and mistris.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-3">
            Popular Worker Categories in Mymensingh
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
          <h3 className="text-2xl font-bold text-white">Are you a worker based in Mymensingh?</h3>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Create your free profile today to reach local customers searching for mistris in Mymensingh.
          </p>
          <div>
            <Link
              href="/join-worker"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all"
            >
              Register Free Profile in Mymensingh
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
