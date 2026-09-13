import Link from "next/link";
import Script from "next/script";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerSearchFilter from "@/components/WorkerSearchFilter";
import { ChevronRight, Wrench, ShieldCheck, UserCheck, PhoneCall, HelpCircle } from "lucide-react";

type Props = {
  params: { slug: string };
};

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
  const title = `${categoryName}${categoryBn} Workers & Technicians in Bangladesh | Sromojibi`;
  const description =
    category?.description ||
    `Discover experienced ${categoryName} mistris, technicians, and specialists in Bangladesh. Free directory listing on Sromojibi.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${siteUrl}/categories/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `${siteUrl}/categories/${slug}`,
      siteName: "Sromojibi",
      locale: "bn_BD",
      type: "website",
      images: [
        {
          url: `${siteUrl}/icon-512.png`,
          width: 512,
          height: 512,
          alt: `${categoryName} Workers Directory Bangladesh`,
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
  });

  const divisions = await prisma.division.findMany({
    orderBy: { title_en: "asc" },
    select: { id: true, title_en: true, title_bn: true },
  });

  const locations = divisions.map((d) => ({
    id: d.id,
    name: d.title_en || d.title_bn || "",
  }));

  // Fetch workers matching this category from database
  const categoryWorkers = await prisma.workerProfile.findMany({
    where: {
      status: "APPROVED",
      workerCategories: {
        some: {
          fk_category_id: category.id,
        },
      },
    },
    orderBy: { created_at: "desc" },
    include: {
      workerCategories: {
        include: {
          category: {
            select: { id: true, name: true, name_bn: true, icon: true, slug: true },
          },
        },
      },
      divisionRef: true,
      districtRef: true,
      upazilaRef: true,
      cityAreaRef: true,
      unionRef: true,
    },
  });

  const serializedWorkers = categoryWorkers.map((w) => {
    const workerCats = w.workerCategories.map((wc) => wc.category);
    const primaryCat = workerCats[0] || null;
    const serviceType = workerCats.length > 0
      ? workerCats.map((c) => c.name_bn || c.name).join(", ")
      : category.name_bn || category.name;

    const locationName = w.cityAreaRef?.title_bn ||
      w.cityAreaRef?.title_en ||
      w.unionRef?.title_bn ||
      w.unionRef?.title_en ||
      w.upazilaRef?.title_bn ||
      w.upazilaRef?.title_en ||
      w.districtRef?.title_bn ||
      w.districtRef?.title_en ||
      "বাংলাদেশ";

    return {
      id: w.id,
      full_name: w.full_name,
      slug: w.slug,
      service_type: serviceType,
      city: locationName,
      zilla: w.districtRef?.title_en || w.districtRef?.title || "",
      upazila: w.upazilaRef?.title_en || w.upazilaRef?.title_bn || "",
      coverage_scope: w.coverage_scope,
      experience: w.experience,
      details: w.details,
      is_verified: w.is_verified,
      rating: Number(w.rating ?? 5.0),
      review_count: w.review_count,
      category: primaryCat ? { name: primaryCat.name, icon: primaryCat.icon } : null,
      categories: workerCats,
    };
  });

  const categoryNameBn = category.name_bn || category.name;

  // FAQ Content for user and Google Search
  const faqs = [
    {
      question: `কিভাবে ${categoryNameBn} মিস্ত্রির সাথে যোগাযোগ করবেন?`,
      answer: `শ্রমজীবী প্ল্যাটফর্মে যে কোনো ${categoryNameBn} কর্মীর প্রোফাইলে গিয়ে "ফোন নম্বর দেখুন" বাটনে ক্লিক করলেই সরাসরি তার প্রাথমিক ও বিকল্প মোবাইল নম্বর প্রদর্শিত হবে। আপনি সরাসরি কল বা WhatsApp মেসেজ পাঠাতে পারবেন।`,
    },
    {
      question: `শ্রমজীবী প্ল্যাটফর্মে মিস্ত্রি খুঁজতে কি কোনো চার্জ বা কমিশন দিতে হয়?`,
      answer: `না, শ্রমজীবী সম্পূর্ণ ফ্রি এবং উন্মুক্ত ডিরেক্টরি। কাস্টমার এবং কর্মীদের মধ্যে কোনো মধ্যস্থতাকারী নেই, তাই কোনো প্রকার কমিশন বা অতিরিক্ত চার্জ প্রদান করতে হয় না।`,
    },
    {
      question: `কাজের রেট বা মজুরি কিভাবে নির্ধারিত হয়?`,
      answer: `কাজের ধরন, সময় এবং পরিধি অনুযায়ী আপনি সরাসরি কর্মীর সাথে আলোচনা করে ন্যায্য পারিশ্রমিক নির্ধারণ করতে পারবেন।`,
    },
  ];

  // Structured Data (Schema.org) for Googlebot
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Categories", item: `${siteUrl}/categories` },
      { "@type": "ListItem", position: 3, name: category.name, item: `${siteUrl}/categories/${category.slug}` },
    ],
  };

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${category.name} Workers & Technicians in Bangladesh`,
    description: category.description || `Verified ${category.name} directory on Sromojibi.`,
    url: `${siteUrl}/categories/${category.slug}`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: categoryWorkers.length,
      itemListElement: categoryWorkers.slice(0, 10).map((w, idx) => ({
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
        id={`category-${slug}-breadcrumb-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <Script
        id={`category-${slug}-collection-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <Script
        id={`category-${slug}-faq-jsonld`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
              <Wrench className="w-7 h-7 text-emerald-700" />
            </div>
            <div>
              <div className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
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
                <div className="font-bold text-slate-900 text-sm">{categoryWorkers.length} জন কারিগর তালিকাভুক্ত</div>
                <div className="text-xs text-slate-500">ভেরিফাইড প্রোফাইল</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-teal-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">সরাসরি ফোন করুন</div>
                <div className="text-xs text-slate-500">কোনো মধ্যস্থতাকারী নেই</div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-cyan-600 shrink-0" />
              <div>
                <div className="font-bold text-slate-900 text-sm">১০০% ফ্রি সেবা</div>
                <div className="text-xs text-slate-500">সরাসরি যোগাযোগের সুবিধা</div>
              </div>
            </div>
          </div>
        </header>

        {/* Worker Search, Filter & Paginated List Section */}
        <section aria-labelledby="category-workers-heading" className="space-y-6">
          <WorkerSearchFilter
            initialWorkers={serializedWorkers}
            categories={categories}
            locations={locations}
          />
        </section>

        {/* Frequently Asked Questions (FAQ) Section for Users and SEO */}
        <section aria-labelledby="category-faq-heading" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h2 id="category-faq-heading" className="text-lg sm:text-xl font-bold text-slate-900">
              সাধারণ জিজ্ঞাসা (FAQ) - {categoryNameBn} সেবা
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {faq.question}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
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
