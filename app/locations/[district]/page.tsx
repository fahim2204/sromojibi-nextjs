import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerSearchFilter from "@/components/WorkerSearchFilter";
import { ChevronRight, MapPin, Wrench, ShieldCheck, UserCheck } from "lucide-react";

type Props = {
  params: { district: string };
};

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

async function getDistrictBySlug(slugParam: string) {
  const decoded = decodeURIComponent(slugParam).toLowerCase().trim();
  const districtName = formatSlug(decoded);

  // 1. Direct query matching title_en, title_bn, or title
  const dbDistrict = await prisma.district.findFirst({
    where: {
      OR: [
        { title_en: { equals: districtName, mode: "insensitive" } },
        { title: { equals: districtName, mode: "insensitive" } },
        { title_bn: { equals: decoded } },
        { title_bn: { contains: districtName } },
      ],
    },
    include: {
      division: true,
      upazilas: {
        orderBy: { title_en: "asc" },
      },
      city_areas: {
        where: { row_status: 1 },
        orderBy: { title_en: "asc" },
      },
    },
  });

  if (dbDistrict) return dbDistrict;

  // 2. Fallback: fetch districts and match via toSlug
  const allDistricts = await prisma.district.findMany({
    include: {
      division: true,
      upazilas: {
        orderBy: { title_en: "asc" },
      },
      city_areas: {
        where: { row_status: 1 },
        orderBy: { title_en: "asc" },
      },
    },
  });

  return (
    allDistricts.find(
      (d) =>
        toSlug(d.title_en) === decoded ||
        toSlug(d.title_bn) === decoded ||
        toSlug(d.title) === decoded
    ) || null
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dbDistrict = await getDistrictBySlug(params.district);

  if (!dbDistrict) {
    return {
      title: "Location Not Found | Sromojibi",
      description: "The requested location could not be found.",
    };
  }

  const districtName = dbDistrict.title_en || formatSlug(params.district);
  const bnTitle = dbDistrict.title_bn ? ` (${dbDistrict.title_bn})` : "";

  return {
    title: `Local Workers in ${districtName}${bnTitle} District | Sromojibi`,
    description: `Find verified electricians, plumbers, rajmistris, tiles workers, and technicians in ${districtName}${bnTitle} district, Bangladesh. Direct phone numbers.`,
    alternates: {
      canonical: `${siteUrl}/locations/${params.district}`,
    },
  };
}

export default async function DistrictLocationPage({ params }: Props) {
  const dbDistrict = await getDistrictBySlug(params.district);

  if (!dbDistrict) {
    notFound();
  }

  const districtName = dbDistrict.title_en || formatSlug(params.district);
  const districtNameBn = dbDistrict.title_bn || districtName;
  const divisionNameBn = dbDistrict.division?.title_bn || "";

  // Fetch active categories & locations for filter dropdowns
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { workerCategories: true } },
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

  // Fetch verified/approved workers in this district
  const districtWorkers = await prisma.workerProfile.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { fk_district_id: dbDistrict.id },
        { coverage_scope: "NATIONWIDE" },
        ...(dbDistrict.loc_division_id
          ? [
              {
                fk_division_id: dbDistrict.loc_division_id,
                coverage_scope: "ALL_DIVISION" as const,
              },
            ]
          : []),
      ],
    },
    orderBy: { created_at: "desc" },
    include: {
      workerCategories: {
        select: {
          category: { select: { icon: true, name: true } },
        },
      },
      divisionRef: { select: { title_en: true, title_bn: true } },
      districtRef: { select: { title_en: true, title_bn: true, title: true } },
      upazilaRef: { select: { title_en: true, title_bn: true } },
      cityAreaRef: { select: { title_en: true, title_bn: true } },
    },
  });

  const allWorkers =
    districtWorkers.length > 0
      ? districtWorkers
      : await prisma.workerProfile.findMany({
          where: { status: "APPROVED" },
          orderBy: { created_at: "desc" },
          include: {
            workerCategories: {
              select: {
                category: { select: { icon: true, name: true } },
              },
            },
            divisionRef: { select: { title_en: true, title_bn: true } },
            districtRef: { select: { title_en: true, title_bn: true, title: true } },
            upazilaRef: { select: { title_en: true, title_bn: true } },
            cityAreaRef: { select: { title_en: true, title_bn: true } },
          },
        });

  const serializedWorkers = allWorkers.map((w: any) => {
    const cats = w.workerCategories?.map((wc: any) => wc.category) || [];
    const city = w.divisionRef?.title_en || w.divisionRef?.title_bn || "Bangladesh";
    const zilla = w.districtRef?.title_en || w.districtRef?.title_bn || w.districtRef?.title || null;
    const upazila = w.cityAreaRef?.title_en || w.upazilaRef?.title_en || w.upazilaRef?.title_bn || null;
    return {
      ...w,
      city,
      zilla,
      upazila,
      rating: Number(w.rating),
      categories: cats,
      category: cats[0] ?? null,
      service_type: cats.length > 0 ? cats.map((c: any) => c.name_bn || c.name).join(", ") : "কারিগর",
    };
  });

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-10">
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
          <span className="text-slate-900 font-bold">{districtNameBn} জেলা</span>
        </nav>

        {/* Hero Section */}
        <header className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200 text-xs font-semibold uppercase tracking-wider">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            {districtNameBn} ({districtName}) District Coverage
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            <span>Workers in {districtName}</span>
            <span className="block text-2xl sm:text-3xl font-extrabold text-blue-600 mt-1">
              {districtNameBn} জেলার দক্ষ মিস্ত্রি ও কারিগর
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed max-w-3xl">
            {districtNameBn} জেলার সকল উপজেলা ও শহরের অভিজ্ঞ ইলেকট্রিশিয়ান, প্লাম্বার, রাজমিস্ত্রি ও টেকনিশিয়ানদের তালিকা ও যোগাযোগের ফোন নম্বর।
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <UserCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">{districtWorkers.length} Local Profiles</div>
                <div className="text-xs text-slate-500">In {districtNameBn}</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <Wrench className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Direct Phone Calls</div>
                <div className="text-xs text-slate-500">No middleman fees</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">Emergency Services</div>
                <div className="text-xs text-slate-500">Quick availability</div>
              </div>
            </div>
          </div>
        </header>

        {/* City Areas Sub-directory Grid (if city areas exist, e.g. Dhaka) */}
        {dbDistrict?.city_areas && dbDistrict.city_areas.length > 0 && (
          <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>{districtNameBn} সিটির এলাকাসমূহ (City Areas & Thanas)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {dbDistrict.city_areas.map((area) => {
                const areaSlug = toSlug(area.title_en || area.title_bn);
                return (
                  <Link
                    key={area.id}
                    href={`/locations/${params.district}/${areaSlug}`}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-center transition-all group"
                  >
                    <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-700">
                      {area.title_bn || area.title_en}
                    </div>
                    {area.title_en && (
                      <div className="text-[10px] text-slate-400 font-medium capitalize">
                        {area.title_en}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Upazilas Sub-directory Grid (if upazilas exist) */}
        {dbDistrict?.upazilas && dbDistrict.upazilas.length > 0 && (
          <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="w-5 h-5 text-emerald-600" />
              <span>{districtNameBn} জেলার উপজেলা সমূহ (Upazilas)</span>
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {dbDistrict.upazilas.map((upazila) => {
                const upazilaSlug = (upazila.title_en || upazila.title_bn || "upazila")
                  .toLowerCase()
                  .replace(/\s+/g, "-");
                return (
                  <Link
                    key={upazila.id}
                    href={`/locations/${params.district}/${upazilaSlug}`}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-center transition-all group"
                  >
                    <div className="font-bold text-slate-900 text-xs group-hover:text-emerald-700">
                      {upazila.title_bn || upazila.title_en}
                    </div>
                    {upazila.title_en && (
                      <div className="text-[10px] text-slate-400 font-medium capitalize">
                        {upazila.title_en}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Worker Search & Filter Section */}
        <section aria-labelledby="district-workers-heading" className="space-y-6">
          <WorkerSearchFilter
            initialWorkers={serializedWorkers}
            categories={categories}
            locations={locations}
          />
        </section>

        {/* Footer Navigation */}
        <div className="pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/locations"
            className="text-xs font-bold text-slate-600 hover:text-emerald-600 transition-colors"
          >
            ← View All Locations & Districts
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
