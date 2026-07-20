import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Launch Locations - Sromojibi Worker Directory",
  description:
    "Explore local worker directory coverage across Bangladesh including Dhaka, Chittagong, Mymensingh, Sylhet, Rajshahi, and Khulna.",
  alternates: {
    canonical: "/locations",
  },
};

export default function LocationsPage() {
  const cities = [
    {
      name: "Dhaka",
      slug: "dhaka",
      division: "Dhaka Division",
      desc: "Metropolitan area including Mirpur, Uttara, Gulshan, Dhanmondi, Mohammadpur, and Gazipur.",
      status: "Launching First",
    },
    {
      name: "Mymensingh",
      slug: "mymensingh",
      division: "Mymensingh Division",
      desc: "Key district center connecting Sadar, Jamalpur, Sherpur, and Netrokona worker networks.",
      status: "Launching First",
    },
    {
      name: "Chittagong",
      slug: "chittagong",
      division: "Chittagong Division",
      desc: "Port city and commercial hub covering Agrabad, Halishahar, Nasirabad, and Cox's Bazar.",
      status: "Launching First",
    },
    {
      name: "Sylhet",
      slug: "sylhet",
      division: "Sylhet Division",
      desc: "District city covering Zindabazar, Amberkhana, Shahjalal Upazila, and Sunamganj.",
      status: "Launching First",
    },
    {
      name: "Rajshahi",
      slug: "rajshahi",
      division: "Rajshahi Division",
      desc: "Northern educational hub covering Boalia, Motihar, Kazla, and Pabna districts.",
      status: "Launching First",
    },
    {
      name: "Khulna",
      slug: "khulna",
      division: "Khulna Division",
      desc: "Southwestern industrial hub covering Khalishpur, Daulatpur, Sonadanga, and Jessore.",
      status: "Launching First",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Supported Regions
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">Launching First in Bangladesh</h1>
          <p className="text-gray-400 text-base md:text-lg">
            Sromojibi worker directory is building initial local listings across primary city centers and divisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cities.map((city) => (
            <div
              key={city.slug}
              className="p-6 rounded-3xl bg-gray-900 border border-gray-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl">🏙️</span>
                  <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {city.status}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {city.name}
                </h2>
                <div className="text-xs text-emerald-400/80 font-medium">{city.division}</div>
                <p className="text-xs text-gray-400 leading-relaxed">{city.desc}</p>
              </div>

              <div className="pt-2 border-t border-gray-800/80">
                <Link
                  href={`/workers/${city.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                >
                  <span>Explore {city.name} Workers Directory</span>
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
