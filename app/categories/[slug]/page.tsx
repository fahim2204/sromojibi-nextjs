import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerSearchFilter from "@/components/WorkerSearchFilter";
import { ChevronRight, Wrench, ShieldCheck, UserCheck } from "lucide-react";

type Props = {
  params: { slug: string };
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({ select: { slug: true } });
    return categories.map((c) => ({ slug: c.slug }));
  } catch (error) {
    return [
      { slug: "electrician" },
      { slug: "plumber" },
      { slug: "rajmistri" },
      { slug: "cctv-installer" },
    ];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const slug = params.slug.toLowerCase();

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  const categoryName = category?.name || slug.replace(/-/g, " ");
  const categoryBn = category?.name_bn ? ` (${category.name_bn})` : "";

  return {
    title: `${categoryName}${categoryBn} Workers & Technicians in Bangladesh | Sromojibi`,
    description: category?.description || `Discover experienced ${categoryName} mistris, technicians, and specialists in Bangladesh. Free directory listing on Sromojibi.`,
    alternates: {
      canonical: `${siteUrl}/categories/${slug}`,
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const slug = params.slug.toLowerCase();

  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    notFound();
  }

  // Fetch all active categories & locations for filter dropdowns
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { workers: true } },
    },
  });

  const divisions = await prisma.division.findMany({
    orderBy: { title_en: "asc" },
    select: { id: true, title_en: true, title_bn: true },
  });

  const locations = divisions.map((d) => ({
    id: d.id,
    name: d.title_en || d.title_bn || "",
  }));

  // Fetch workers matching this category
  const categoryWorkers = await prisma.workerProfile.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { fk_category_id: category.id },
        { service_type: { equals: category.name, mode: "insensitive" } },
      ],
    },
    orderBy: { created_at: "desc" },
    include: {
      category: { select: { icon: true, name: true } },
    },
  });

  const serializedWorkers = categoryWorkers.map((w) => ({
    ...w,
    rating: Number(w.rating),
  }));

  const categoryNameBn = category.name_bn || category.name;
  const iconEmoji = category.icon || "🛠️";

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Breadcrumb Header */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/categories" className="hover:text-emerald-600 transition-colors">Categories</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{category.name} ({categoryNameBn})</span>
        </nav>

        {/* Hero Section */}
        <header className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-3xl font-bold shrink-0">
              {iconEmoji}
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                Category Directory
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {category.name} <span className="text-emerald-600 font-extrabold">({categoryNameBn})</span>
              </h1>
            </div>
          </div>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
            {category.description || `বাংলাদেশে অভিজ্ঞ ${categoryNameBn} মিস্ত্রি ও টেকনিশিয়ানদের বিস্তারিত তালিকা ও যোগাযোগের ফোন নম্বর।`}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">{categoryWorkers.length} Verified Workers</div>
                <div className="text-xs text-slate-500">Active Profiles</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Wrench className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Direct Contact</div>
                <div className="text-xs text-slate-500">Call mistri directly</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">100% Free Listing</div>
                <div className="text-xs text-slate-500">No middleman fee</div>
              </div>
            </div>
          </div>
        </header>

        {/* Worker Search & Filter Section */}
        <section aria-labelledby="category-workers-heading" className="space-y-6">
          <WorkerSearchFilter
            initialWorkers={serializedWorkers}
            categories={categories}
            locations={locations}
          />
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/categories"
            className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            ← View All Service Categories
          </Link>
          <Link
            href="/workers"
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            Explore Full Workers Directory →
          </Link>
        </div>
      </div>
    </main>
  );
}
