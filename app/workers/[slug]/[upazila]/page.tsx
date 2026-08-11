import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerSearchFilter from "@/components/WorkerSearchFilter";
import { ChevronRight, MapPin, Wrench, ShieldCheck, UserCheck } from "lucide-react";

type Props = {
  params: { slug: string; upazila: string };
};

export const dynamic = "force-dynamic";
export const revalidate = 60;

function formatSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const formattedUpazila = formatSlug(params.upazila);
  const formattedDistrict = formatSlug(params.slug);

  const dbUpazila = await prisma.upazila.findFirst({
    where: {
      OR: [
        { title_en: { equals: formattedUpazila, mode: "insensitive" } },
        { title_bn: { contains: formattedUpazila } },
      ],
    },
  });

  const bnTitle = dbUpazila?.title_bn ? ` (${dbUpazila.title_bn})` : "";

  return {
    title: `Local Workers in ${formattedUpazila}${bnTitle}, ${formattedDistrict} | Sromojibi`,
    description: `Find verified local workers, electricians, plumbers, mistris, and technicians in ${formattedUpazila}${bnTitle} upazila, ${formattedDistrict} district.`,
    alternates: {
      canonical: `/workers/${params.slug}/${params.upazila}`,
    },
  };
}

export default async function UpazilaWorkersPage({ params }: Props) {
  const upazilaName = formatSlug(params.upazila);
  const districtName = formatSlug(params.slug);

  // Query database for Upazila, District, and Division Bengali titles
  const dbUpazila = await prisma.upazila.findFirst({
    where: {
      OR: [
        { title_en: { equals: upazilaName, mode: "insensitive" } },
        { title_bn: { contains: upazilaName } },
      ],
    },
    include: {
      district: {
        include: { division: true },
      },
    },
  });

  const upazilaNameBn = dbUpazila?.title_bn || upazilaName;
  const districtNameBn = dbUpazila?.district?.title_bn || districtName;
  const divisionNameBn = dbUpazila?.district?.division?.title_bn || "";

  // Fetch active categories
  const categories = await prisma.category.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { workers: true },
      },
    },
  });

  // Fetch active locations
  const locations = await prisma.location.findMany({
    where: { is_active: true },
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { workers: true },
      },
    },
  });

  // Query workers matching upazila or district
  const upazilaWorkers = await prisma.workerProfile.findMany({
    where: {
      status: "APPROVED",
      OR: [
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

  const allApprovedWorkers =
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
          <Link href="/" className="hover:text-emerald-600">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href="/locations" className="hover:text-emerald-600">Locations</Link>
          {divisionNameBn && (
            <>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/locations" className="hover:text-emerald-600">{divisionNameBn}</Link>
            </>
          )}
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link href={`/workers/${params.slug}`} className="hover:text-emerald-600">{districtNameBn} জেলা</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-900 font-bold">{upazilaNameBn} উপজেলা</span>
        </nav>

        {/* Hero Section with H1 */}
        <header className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100/80 text-blue-800 border border-blue-200 text-xs font-semibold uppercase tracking-wider">
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
        </header>

        {/* Features Highlights Section with H2 */}
        <section aria-labelledby="upazila-highlights-heading" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <h2 id="upazila-highlights-heading" className="sr-only">Upazila Worker Directory Features</h2>
          
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 w-fit">
              <UserCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              লোকাল কারিগর ({upazilaNameBn})
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {upazilaNameBn} উপজেলার ভেতরে বসবাসকারী নির্ভরযোগ্য ওয়ার্কারদের ফোন নম্বর।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 w-fit">
              <Wrench className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">জরুরি কাজ ও মেরামত</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              ইলেকট্রিক শট সার্কিট, লাইন লিকেজ, এসি গ্যাস রিফিল ও নির্মাণ কাজ।
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="p-2.5 rounded-2xl bg-indigo-50 text-indigo-600 w-fit">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">সরাসরি যোগাযোগের সুযোগ</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {upazilaNameBn} উপজেলার কারিগরদের সাথে কল করে কাজের রেট আলোচনা করুন।
            </p>
          </div>
        </section>

        {/* Worker Search & Filter Section with H2 */}
        <section aria-labelledby="upazila-directory-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
            <div>
              <h2 id="upazila-directory-heading" className="text-2xl font-black text-slate-900">
                {upazilaNameBn} উপজেলা ওয়ার্কার তালিকা
              </h2>
              <p className="text-xs text-slate-500">Worker Directory for {upazilaName} Upazila</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">
              {allApprovedWorkers.length} Active Profiles
            </span>
          </div>

          <WorkerSearchFilter
            initialWorkers={allApprovedWorkers}
            categories={categories}
            locations={locations}
          />
        </section>
      </div>
    </main>
  );
}
