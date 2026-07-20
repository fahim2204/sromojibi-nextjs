import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Electrician Directory Bangladesh - Find Local Electricians Near You",
  description:
    "Find trusted electricians in Bangladesh for house wiring, breaker repair, appliance installation, and electrical troubleshooting.",
  alternates: {
    canonical: "/workers/electrician",
  },
};

export default function ElectricianWorkersPage() {
  const cities = [
    { name: "Electrician in Dhaka", slug: "dhaka" },
    { name: "Electrician in Mymensingh", slug: "mymensingh" },
    { name: "Electrician in Chittagong", slug: "chittagong" },
    { name: "Electrician in Sylhet", slug: "sylhet" },
    { name: "Electrician in Rajshahi", slug: "rajshahi" },
    { name: "Electrician in Khulna", slug: "khulna" },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Link href="/workers" className="hover:underline">Workers</Link>
            <span>/</span>
            <span>Electrician</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-4xl">⚡</span>
            <h1 className="text-4xl sm:text-5xl font-black text-white">
              Electrician Directory Bangladesh
            </h1>
          </div>
          <p className="text-gray-300 text-base md:text-lg max-w-3xl">
            Sromojibi helps households and businesses discover licensed and experienced electricians for house wiring, short circuit troubleshooting, DB board installation, and electrical repairs.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-gray-900 border border-gray-800 space-y-4">
          <h2 className="text-xl font-bold text-white border-b border-gray-800 pb-3">
            Browse Electricians by Launch Cities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/workers/${city.slug}`}
                className="p-4 rounded-2xl bg-gray-950 border border-gray-800 flex items-center gap-3 hover:border-emerald-500/50 transition-all group"
              >
                <span className="text-xl">🏙️</span>
                <span className="text-sm font-bold text-gray-200 group-hover:text-emerald-400 transition-colors">
                  {city.name}
                </span>
              </Link>
            ))}
          </div>
        </div>

        <div className="p-8 rounded-3xl bg-emerald-950/30 border border-emerald-500/30 text-center space-y-4">
          <h3 className="text-2xl font-bold text-white">Are you a skilled Electrician?</h3>
          <p className="text-gray-300 text-sm max-w-xl mx-auto">
            Create your free electrician profile on Sromojibi to help local customers discover your services.
          </p>
          <div>
            <Link
              href="/join-worker"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all"
            >
              Register Free Electrician Profile
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
