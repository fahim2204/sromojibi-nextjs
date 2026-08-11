import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { ArrowRight, Wrench, Sparkles, CheckCircle2 } from "lucide-react";

export const dynamic = "force-dynamic";
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Service Categories | কাজের ধরন অনুযায়ী মিস্ত্রি ডিরেক্টরি | Sromojibi",
  description:
    "Explore worker service categories including Rajmistri, Electrician, Plumber, Tiles Worker, Painter, Carpenter, AC Technician, and CCTV Installer in Bangladesh.",
  alternates: {
    canonical: "/categories",
  },
};

interface CategoryDisplay {
  name: string;
  nameBn: string;
  icon: string;
  slug: string;
  description: string;
  descriptionBn: string;
  popular?: boolean;
}

const fallbackCategories: CategoryDisplay[] = [
  {
    name: "Electrician",
    nameBn: "ইলেকট্রিশিয়ান",
    icon: "⚡",
    slug: "electrician",
    description: "House wiring, circuit breaker maintenance, light fittings, and electrical troubleshooting.",
    descriptionBn: "হাউজ ওয়্যারিং, সার্কিট ব্রেকার মেরামত, ফ্যান-লাইট ফিটিং ও ইলেকট্রিক কাজের অভিজ্ঞ মিস্ত্রি।",
    popular: true,
  },
  {
    name: "Rajmistri",
    nameBn: "রাজমিস্ত্রি (বিল্ডিং নির্মাণ)",
    icon: "🏠",
    slug: "rajmistri",
    description: "Masonry, bricklaying, foundation work, roof slabs, and civil structural work.",
    descriptionBn: "বাড়ি নির্মাণ, ইট গাথুনি, ছাদ ঢালাই, প্লাস্টার ও সিভিল কনস্ট্রাকশনের অভিজ্ঞ রাজমিস্ত্রি।",
    popular: true,
  },
  {
    name: "Plumber",
    nameBn: "প্ল্যাম্বার (পাইপ ও স্যানিটারি)",
    icon: "🚰",
    slug: "plumber",
    description: "Pipe fitting, water pump installation, bathroom sanitary fittings, and leak repairs.",
    descriptionBn: "পানির পাইপ ফিটিং, মোটর ইনস্টলেশন, বাথরুম স্যানিটারি কাজ ও পানি লিকেজ মেরামত মিস্ত্রি।",
    popular: true,
  },
  {
    name: "Tiles Worker",
    nameBn: "টাইলস মিস্ত্রি",
    icon: "🧱",
    slug: "tiles-worker",
    description: "Floor tiles, marble polishing, kitchen wall tiling, and bathroom tile fitting.",
    descriptionBn: "ফ্লোর টাইলস, মার্বেল পাথর পলিশ, কিচেন ও বাথরুমের ওয়াল টাইলস বসানোর দক্ষ মিস্ত্রি।",
    popular: true,
  },
  {
    name: "Painter",
    nameBn: "রং মিস্ত্রি (পেইন্টার)",
    icon: "🎨",
    slug: "painter",
    description: "Wall putty, interior & exterior acrylic painting, texture paint, and wood polish.",
    descriptionBn: "দেয়ালের পুটি, ইনটেরিয়র ও এক্সটেরিয়র রং, বার্নিশ, উড পলিশ ও ডেকোরেটিভ পেইন্টিং মিস্ত্রি।",
    popular: true,
  },
  {
    name: "Carpenter",
    nameBn: "কাঠ মিস্ত্রি (কার্পেন্টার)",
    icon: "🔨",
    slug: "carpenter",
    description: "Door fitting, window frames, custom cabinet woodwork, and furniture repair mistris.",
    descriptionBn: "দরজা-জানালা তৈরি, কিচেন ক্যাবিনেট, কাঠের ফার্নিচার তৈরি ও মেরামতের অভিজ্ঞ কার্পেন্টার।",
    popular: true,
  },
  {
    name: "AC Technician",
    nameBn: "এসি টেকনিশিয়ান",
    icon: "❄️",
    slug: "ac-technician",
    description: "Split & window AC installation, master cleaning, gas refilling, and compressor repairs.",
    descriptionBn: "স্প্লিট ও উইন্ডো এসি ফিটিং, মাস্টার ওয়াশ, গ্যাস রিফিল ও কমপ্রেসর মেরামতের টেকনিশিয়ান।",
    popular: true,
  },
  {
    name: "CCTV Installer",
    nameBn: "সিসিটিভি কারিগর",
    icon: "📹",
    slug: "cctv-installer",
    description: "IP camera setup, DVR/NVR configuration, security system wiring, and maintenance.",
    descriptionBn: "আইপি ক্যামেরা সেটআপ, ডিভিআর ক্যাবল কানেকশন ও সিকিউরিটি সিস্টেম ইনস্টলেশন টেকনিশিয়ান।",
    popular: true,
  },
];

export default async function CategoriesPage() {
  let categoriesToDisplay = fallbackCategories;

  try {
    const dbCategories = await prisma.category.findMany({
      where: { is_active: true },
      orderBy: { name: "asc" },
    });

    if (dbCategories.length > 0) {
      categoriesToDisplay = dbCategories.map((c) => {
        const match = fallbackCategories.find((f) => f.slug === c.slug);
        return {
          name: c.name,
          nameBn: c.name_bn || match?.nameBn || c.name,
          icon: c.icon || match?.icon || "🛠️",
          slug: c.slug,
          description: c.description || match?.description || "Skilled trade services across Bangladesh.",
          descriptionBn: match?.descriptionBn || "বাংলাদেশের সকল এলাকার অভিজ্ঞ কারিগর ও টেকনিশিয়ান।",
          popular: true,
        };
      });
    }
  } catch (err) {
    console.error("Error fetching categories from database:", err);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-100/90 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Wrench className="w-3.5 h-3.5 text-emerald-600" />
            সার্ভিস ক্যাটাগরি • Directory Categories
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            <span>Popular Worker Categories</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-emerald-600 mt-2">
              কাজের ধরন অনুযায়ী দক্ষ মিস্ত্রি ও কারিগর
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            আপনার প্রয়োজনীয় কাজের ক্যাটাগরি বেছে নিন এবং সরাসরি যোগাযোগের জন্য আপনার এলাকার সেরা ওয়ার্কারদের খুঁজুন।
          </p>
        </header>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categoriesToDisplay.map((cat) => (
            <div
              key={cat.slug}
              className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-emerald-500/60 hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-5 group shadow-2xs"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-4xl group-hover:scale-110 transition-transform duration-200 inline-block p-2 rounded-2xl bg-slate-100/80">
                    {cat.icon}
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[11px] font-bold">
                    ✓ Verified Directory
                  </span>
                </div>

                <div className="space-y-1">
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                    <span>{cat.nameBn}</span>
                  </h2>
                  <p className="text-xs font-semibold text-slate-400">
                    {cat.name} Trade Specialists
                  </p>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed font-normal">
                  {cat.descriptionBn}
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Link
                  href={`/workers/${cat.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 hover:text-emerald-700 transition-colors group-hover:translate-x-0.5 transition-transform"
                >
                  <span>ওয়ার্কার তালিকা দেখুন ({cat.name})</span>
                  <ArrowRight className="w-3.5 h-3.5 text-emerald-600" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Navigation */}
        <div className="text-center pt-4">
          <Link
            href="/workers"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-500/50 text-xs font-bold text-slate-700 hover:text-emerald-600 transition-all shadow-2xs"
          >
            ← Back to All Workers Directory
          </Link>
        </div>
      </div>
    </main>
  );
}
