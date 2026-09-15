import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerSearchFilter from "@/components/WorkerSearchFilter";
import { ChevronRight, MapPin, Wrench, ShieldCheck, UserCheck, Sparkles } from "lucide-react";

type Props = {
  params: { district: string; upazila: string };
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
      unions: {
        where: { row_status: 1 },
        orderBy: { title_bn: "asc" },
        select: {
          id: true,
          title_bn: true,
          title_en: true,
        },
      },
    },
  });

  if (dbUpazila) return { ...dbUpazila, isCityArea: false };

  // 2. Direct query matching city_area and district
  let dbCityArea = await prisma.cityArea.findFirst({
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

  if (dbCityArea) return { ...dbCityArea, isCityArea: true };

  // 3. Fallback: match via toSlug on Upazilas
  const allUpazilas = await prisma.upazila.findMany({
    include: {
      district: {
        include: { division: true },
      },
      unions: {
        where: { row_status: 1 },
        orderBy: { title_bn: "asc" },
        select: {
          id: true,
          title_bn: true,
          title_en: true,
        },
      },
    },
  });

  const matchedUpz = allUpazilas.find((u) => {
    const uSlugMatch =
      toSlug(u.title_en) === decodedUpazila ||
      toSlug(u.title_bn) === decodedUpazila;
    const dSlugMatch =
      toSlug(u.district?.title_en) === decodedDistrict ||
      toSlug(u.district?.title_bn) === decodedDistrict ||
      toSlug(u.district?.title) === decodedDistrict;
    return uSlugMatch && dSlugMatch;
  });

  if (matchedUpz) return { ...matchedUpz, isCityArea: false };

  // 4. Fallback: match via toSlug on City Areas
  const allCityAreas = await prisma.cityArea.findMany({
    include: {
      district: {
        include: { division: true },
      },
    },
  });

  const matchedCityArea = allCityAreas.find((ca) => {
    const caSlugMatch =
      toSlug(ca.title_en) === decodedUpazila ||
      toSlug(ca.title_bn) === decodedUpazila;
    const dSlugMatch =
      toSlug(ca.district?.title_en) === decodedDistrict ||
      toSlug(ca.district?.title_bn) === decodedDistrict ||
      toSlug(ca.district?.title) === decodedDistrict;
    return caSlugMatch && dSlugMatch;
  });

  if (matchedCityArea) return { ...matchedCityArea, isCityArea: true };

  return null;
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
  const title = `Local Workers in ${upazilaName}${bnTitle}, ${districtName} | Sromojibi`;
  const description = `Find verified local workers, electricians, plumbers, mistris, and technicians in ${upazilaName}${bnTitle} upazila, ${districtName} district. Direct phone numbers.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/locations/${params.district}/${params.upazila}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/locations/${params.district}/${params.upazila}`,
      siteName: "Sromojibi",
      locale: "bn_BD",
      type: "website",
      images: [
        {
          url: `${siteUrl}/icon-512.png`,
          width: 512,
          height: 512,
          alt: `Workers in ${upazilaName}, ${districtName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/icon-512.png`],
    },
    robots: {
      index: true,
      follow: true,
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
  const unions = !dbUpazila.isCityArea && "unions" in dbUpazila
    ? ((dbUpazila as any).unions as Array<{ id: string; title_bn: string | null; title_en: string | null }>)
    : [];

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

  const areaLabelBn = dbUpazila.isCityArea ? "সিটি এলাকা" : "উপজেলা";

  // Query workers matching upazila or district-wide coverage
  const upazilaWorkers = await prisma.workerProfile.findMany({
    where: {
      status: "APPROVED",
      OR: [
        ...(dbUpazila.isCityArea
          ? [{ fk_city_area_id: dbUpazila.id }]
          : [{ fk_upazila_id: dbUpazila.id }]),
        ...(dbUpazila.loc_district_id
          ? [
              {
                fk_district_id: dbUpazila.loc_district_id,
                coverage_scope: "ALL_DISTRICT" as const,
              },
            ]
          : []),
        { coverage_scope: "NATIONWIDE" as const },
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
    upazilaWorkers.length > 0
      ? upazilaWorkers
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

  const faqs = [
    {
      question: `${upazilaNameBn} এলাকায় মিস্ত্রিদের সাথে কিভাবে সরাসরি যোগাযোগ করব?`,
      answer: `শ্রমজীবী ডিরেক্টরিতে ${upazilaNameBn} এলাকার তালিকাভুক্ত মিস্ত্রি ও টেকনিশিয়ানদের প্রোফাইল থেকে সরাসরি তাদের মোবাইল নম্বরে ফোন কল বা হোয়াটসঅ্যাপে কথা বলে বুকিং করতে পারেন।`,
    },
    {
      question: `${upazilaNameBn} ${areaLabelBn}য় কাজের পারিশ্রমিক কেমন?`,
      answer: `কাজের পরিধি ও সময় অনুযায়ী আপনি সরাসরি শ্রমজীবী কর্মীর সাথে আলোচনা করে দরদাম ও সঠিক পারিশ্রমিক নির্ধারণ করতে পারেন। এতে কোনো তৃতীয় পক্ষ বা কমিশন নেই।`,
    },
    {
      question: `শ্রমজীবীর মিস্ত্রি সার্ভিস কি ফ্রি?`,
      answer: `হ্যাঁ, শ্রমজীবী গ্রাহকদের জন্য সম্পূর্ণ ফ্রি প্ল্যাটফর্ম। মিস্ত্রিদের নাম্বার দেখতে বা যোগাযোগ করতে কোনো ফি বা চার্জ দিতে হয় না।`,
    },
  ];

  // Schema.org Structured Data
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Locations", item: `${siteUrl}/locations` },
      { "@type": "ListItem", position: 3, name: `${districtName} District`, item: `${siteUrl}/locations/${params.district}` },
      { "@type": "ListItem", position: 4, name: `${upazilaName} ${areaLabelBn}`, item: `${siteUrl}/locations/${params.district}/${params.upazila}` },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Local Workers in ${upazilaName}, ${districtName}, Bangladesh`,
    description: `Find verified local workers, electricians, plumbers, mistris, and technicians in ${upazilaName} ${areaLabelBn}, ${districtName} district.`,
    url: `${siteUrl}/locations/${params.district}/${params.upazila}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: upazilaWorkers.length,
      itemListElement: (upazilaWorkers.length > 0 ? upazilaWorkers : allWorkers).slice(0, 10).map((w: any, idx: number) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: w.full_name,
        url: `${siteUrl}/workers/${w.slug}`,
      })),
    },
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      {/* Schema.org Structured Data with unique IDs */}
      <Script
        id={`upazila-${params.district}-${params.upazila}-breadcrumb-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`upazila-${params.district}-${params.upazila}-collection-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Script
        id={`upazila-${params.district}-${params.upazila}-faq-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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
          <span className="text-slate-900 font-bold">{upazilaNameBn} {areaLabelBn}</span>
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
              {upazilaNameBn} {areaLabelBn}য় দক্ষ লোকাল মিস্ত্রি ও কারিগর
            </span>
          </h1>

          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            {upazilaNameBn} {areaLabelBn} এবং {districtNameBn} জেলার অভিজ্ঞ টেকনিশিয়ান, কারিগর ও ইলেকট্রিক প্লাম্বিং সার্ভিস ডিরেক্টরি।
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

        {/* Unions Section (for Upazilas with Unions) */}
        {unions.length > 0 && (
          <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <span>{upazilaNameBn} উপজেলার অন্তর্ভুক্ত ইউনিয়নসমূহ ({unions.length}টি ইউনিয়ন)</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">লোকাল সার্ভিস ইউনিয়ন</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {unions.map((union) => (
                <div
                  key={union.id}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 border border-slate-200/80 text-slate-800"
                >
                  <span>{union.title_bn || union.title_en}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Popular Category Links in this Location */}
        {categories.length > 0 && (
          <section className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>{upazilaNameBn} এলাকার জনপ্রিয় সেবা ও মিস্ত্রি</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">ক্যাটাগরি ভিত্তিক সেবা</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {categories.slice(0, 14).map((cat) => (
                <Link
                  key={cat.id}
                  href={`/locations/${params.district}/${params.upazila}/${cat.slug}`}
                  className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 hover:border-emerald-300 transition-colors"
                >
                  {cat.name_bn || cat.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Worker Search & Filter Section */}
        <section aria-labelledby="upazila-directory-heading" className="space-y-6">
          <WorkerSearchFilter
            initialWorkers={serializedWorkers}
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
