import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerSearchFilter from "@/components/WorkerSearchFilter";
import { ChevronRight, MapPin, Wrench, ShieldCheck, UserCheck } from "lucide-react";

type Props = {
  params: { district: string; upazila: string };
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function toSlug(name: string | null): string {
  if (!name) return "";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getUpazilaAndDistrict(districtParam: string, upazilaParam: string) {
  const decodedDistrict = decodeURIComponent(districtParam).toLowerCase().trim();
  const decodedUpazila = decodeURIComponent(upazilaParam).toLowerCase().trim();

  const formattedDistrict = formatSlug(decodedDistrict);
  const formattedUpazila = formatSlug(decodedUpazila);

  // 1. Direct query matching upazila and district
  let dbUpazila = await prisma.upazila.findFirst({
    where: {
      OR: [
        { title_en: { equals: formattedUpazila, mode: "insensitive" } },
        { title_bn: { equals: decodedUpazila } },
        { title_bn: { contains: formattedUpazila } },
      ],
      district: {
        OR: [
          { title_en: { equals: formattedDistrict, mode: "insensitive" } },
          { title: { equals: formattedDistrict, mode: "insensitive" } },
          { title_bn: { equals: decodedDistrict } },
          { title_bn: { contains: formattedDistrict } },
        ],
      },
    },
    include: {
      district: {
        include: { division: true },
      },
    },
  });

  if (dbUpazila) return dbUpazila;

  // 2. Fallback: match via toSlug
  const allUpazilas = await prisma.upazila.findMany({
    include: {
      district: {
        include: { division: true },
      },
    },
  });

  return (
    allUpazilas.find((u) => {
      const uSlugMatch =
        toSlug(u.title_en) === decodedUpazila ||
        toSlug(u.title_bn) === decodedUpazila;
      const dSlugMatch =
        toSlug(u.district?.title_en) === decodedDistrict ||
        toSlug(u.district?.title_bn) === decodedDistrict ||
        toSlug(u.district?.title) === decodedDistrict;
      return uSlugMatch && dSlugMatch;
    }) || null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dbUpazila = await getUpazilaAndDistrict(params.district, params.upazila);

  if (!dbUpazila) {
    return {
      title: "Location Not Found | Sromojibi",
      description: "The requested upazila or location could not be found.",
    };
  }

  const upazilaName = dbUpazila.title_en || formatSlug(params.upazila);
  const districtName = dbUpazila.district?.title_en || formatSlug(params.district);
  const bnTitle = dbUpazila.title_bn ? ` (${dbUpazila.title_bn})` : "";

  return {
    title: `Local Workers in ${upazilaName}${bnTitle}, ${districtName} | Sromojibi`,
    description: `Find verified local workers, electricians, plumbers, mistris, and technicians in ${upazilaName}${bnTitle} upazila, ${districtName} district.`,
    alternates: {
      canonical: `${siteUrl}/locations/${params.district}/${params.upazila}`,
    },
  };
}

export default async function UpazilaLocationPage({ params }: Props) {
  const dbUpazila = await getUpazilaAndDistrict(params.district, params.upazila);

  if (!dbUpazila) {
    notFound();
  }

  const upazilaName = dbUpazila.title_en || formatSlug(params.upazila);
  const districtName = dbUpazila.district?.title_en || formatSlug(params.district);

  const upazilaNameBn = dbUpazila.title_bn || upazilaName;
  const districtNameBn = dbUpazila.district?.title_bn || districtName;
  const divisionNameBn = dbUpazila.district?.division?.title_bn || "";

  // Fetch active categories & locations for filter dropdowns
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { workers: true } },
    },
  });

  const locations = await prisma.location.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { workers: true } },
    },
  });

  // Query workers matching upazila or district
  const upazilaWorkers = await prisma.workerProfile.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { fk_upazila_id: dbUpazila.id },
        { upazila: { contains: upazilaName, mode: "insensitive" } },
        { upazila: { contains: upazilaNameBn } },
        { zilla: { contains: districtName, mode: "insensitive" } },
        { zilla: { contains: districtNameBn } },
        { city: { contains: districtName, mode: "insensitive" } },
      ],
    },
    orderBy: { created_at: "desc" },
    include: {
      category: { select: { icon: true, name: true } },
      location: { select: { name: true } },
    },
  });

  const allWorkers =
    upazilaWorkers.length > 0
      ? upazilaWorkers
      : await prisma.workerProfile.findMany({
          where: { status: "APPROVED" },
          orderBy: { created_at: "desc" },
          include: {
            category: { select: { icon: true, name: true } },
            location: { select: { name: true } },
          },
        });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Breadcrumb Header */}
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
          <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/locations" className="hover:text-emerald-600 transition-colors">Locations</Link>
          {divisionNameBn && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-600">{divisionNameBn} বিভাগ</span>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href={`/locations/${params.district}`} className="hover:text-emerald-600 transition-colors">
            {districtNameBn} জেলা
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{upazilaNameBn} উপজেলা</span>
        </nav>

        {/* Hero Section */}
        <header className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200 text-xs font-semibold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            {upazilaNameBn} ({upazilaName}) • {districtNameBn} জেলা
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
            <span>Skilled Local Workers in {upazilaName}</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-blue-600 mt-2">
              {upazilaNameBn} উপজেলায় দক্ষ লোকাল মিস্ত্রি ও কারিগর
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {upazilaNameBn} উপজেলা এবং {districtNameBn} জেলার অভিজ্ঞ টেকনিশিয়ান, কারিগর ও ইলেকট্রিক প্লাম্বিং সার্ভিস ডিরেক্টরি।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">{upazilaWorkers.length} Active Workers</div>
                <div className="text-xs text-slate-500">In {upazilaNameBn}</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Wrench className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Emergency Service</div>
                <div className="text-xs text-slate-500">Quick local response</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Direct Phone Calls</div>
                <div className="text-xs text-slate-500">Free call to mistri</div>
              </div>
            </div>
          </div>
        </header>

        {/* Worker Search & Filter Section */}
        <section aria-labelledby="upazila-directory-heading" className="space-y-6">
          <WorkerSearchFilter
            initialWorkers={allWorkers}
            categories={categories}
            locations={locations}
          />
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <Link
            href={`/locations/${params.district}`}
            className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            ← Back to {districtNameBn} District
          </Link>
          <Link
            href="/locations"
            className="text-xs font-bold text-emerald-600 hover:underline"
          >
            All Locations Directory →
          </Link>
        </div>
      </div>
    </main>
  );
}
