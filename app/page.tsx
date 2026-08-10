import React from "react";
import Link from "next/link";
import type { Metadata } from "next";
import NotifyForm from "@/components/NotifyForm";
import HomeFaqAccordion from "@/components/HomeFaqAccordion";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export const metadata: Metadata = {
  title: "Sromojibi - Find Trusted Local Workers in Bangladesh",
  description:
    "Discover skilled electricians, plumbers, tiles mistris, rajmistris, painters, and local home service specialists across Bangladesh. Free directory for workers and customers.",
  keywords: [
    "worker directory bangladesh",
    "mistri bangladesh",
    "rajmistri bangladesh",
    "electrician dhaka",
    "plumber bangladesh",
    "tiles mistri",
    "home service bangladesh",
    "local trade workers near me",
    "kajer lok directory",
    "sromojibi worker list",
  ],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Sromojibi - Find Trusted Local Workers in Bangladesh",
    description:
      "Discover skilled electricians, plumbers, tiles mistris, rajmistris, painters, and local home service specialists across Bangladesh.",
    url: siteUrl,
    siteName: "Sromojibi",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sromojibi - Find Trusted Local Workers in Bangladesh",
    description:
      "Discover skilled electricians, plumbers, tiles mistris, rajmistris, painters, and local home service specialists across Bangladesh.",
  },
};

const categories = [
  { name: "Rajmistri", icon: "🏠", slug: "rajmistri", description: "Masonry & civil construction specialists" },
  { name: "Electrician", icon: "⚡", slug: "electrician", description: "Wiring, repairs & electrical installations" },
  { name: "Plumber", icon: "🚰", slug: "plumber", description: "Pipe fitting, sanitary & water line repairs" },
  { name: "Tiles Worker", icon: "🧱", slug: "tiles-worker", description: "Floor & wall tile installation mistris" },
  { name: "Painter", icon: "🎨", slug: "painter", description: "Interior & exterior wall painting experts" },
  { name: "Carpenter", icon: "🔨", slug: "carpenter", description: "Furniture repair, wood work & fittings" },
  { name: "AC Technician", icon: "❄️", slug: "ac-technician", description: "Air conditioner servicing & gas refill" },
  { name: "CCTV Installer", icon: "📹", slug: "cctv-installer", description: "Security camera setup & network wiring" },
];

const cities = [
  { name: "Dhaka", count: "Coming Soon", slug: "dhaka", popular: true },
  { name: "Chittagong", count: "Coming Soon", slug: "chittagong", popular: true },
  { name: "Mymensingh", count: "Coming Soon", slug: "mymensingh", popular: true },
  { name: "Sylhet", count: "Coming Soon", slug: "sylhet", popular: false },
  { name: "Rajshahi", count: "Coming Soon", slug: "rajshahi", popular: false },
  { name: "Khulna", count: "Coming Soon", slug: "khulna", popular: false },
];

const faqs = [
  {
    question: "What is Sromojibi?",
    answer:
      "Sromojibi is a worker directory platform helping people discover skilled professionals across Bangladesh. Our goal is to connect local technicians, mistris, and handymen with nearby homeowners and businesses.",
  },
  {
    question: "How can workers join?",
    answer:
      "Workers can create a free profile and share their service information, location, experience, and contact detail so local customers can easily discover them online.",
  },
  {
    question: "Is Sromojibi free?",
    answer:
      "Yes, worker listings will be free during the initial launch period to help build Bangladesh's largest open worker directory.",
  },
];

export default function Home() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      {/* FAQ Structured Data for Google Rich Snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* 1. Hero Section */}
      <section className="relative py-20 lg:py-28 px-4 border-b border-gray-200/80 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-slate-50">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-100/20 via-slate-50/50 to-slate-50 pointer-events-none" />
        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-800 text-xs md:text-sm font-semibold tracking-wide shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Bangladesh&apos;s Emerging Worker Directory
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Find Trusted Local Workers Across{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Bangladesh
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto font-normal leading-relaxed">
            Sromojibi is building a simple way to find electricians, plumbers, tiles workers, rajmistris, and skilled professionals near you.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/join-worker"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>👷‍♂️</span> Join as a Worker
            </Link>
            <a
              href="#notify-section"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-semibold text-base shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>🔔</span> Notify Me When Available
            </a>
          </div>
        </div>
      </section>

      {/* 2. Problem Section */}
      <section className="py-16 px-4 border-b border-gray-200/80 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="text-emerald-600 font-bold text-xs uppercase tracking-widest">The Challenge</div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900">
            Finding a reliable worker is still difficult
          </h2>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto pt-2">
            Millions of skilled workers provide valuable services every day, but finding the right person often depends on personal contacts and recommendations.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 text-left">
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-3">🔍</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Hard to Search</h3>
              <p className="text-sm text-gray-600">Word-of-mouth contact lists are limited and often unreliable in emergencies.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-3">📱</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Limited Online Presence</h3>
              <p className="text-sm text-gray-600">Skilled mistris lack standard public profiles for local customers to discover.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200/80 hover:border-emerald-300 hover:shadow-md transition-all">
              <div className="text-2xl mb-3">📍</div>
              <h3 className="font-bold text-gray-900 text-lg mb-2">Neighborhood Mismatch</h3>
              <p className="text-sm text-gray-600">Connecting local talent with nearby households requires organized location mapping.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Categories Section */}
      <section className="py-16 px-4 border-b border-gray-200/80 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="px-3 py-1 rounded-full bg-teal-100 text-teal-800 text-xs font-semibold uppercase tracking-wider">
              Browse Directory
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Popular Services Coming Soon</h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              Discover skilled workers by specialty across Bangladesh.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/workers/${cat.slug}`}
                className="group relative p-6 rounded-2xl bg-white border border-gray-200 hover:border-emerald-500/50 hover:shadow-lg transition-all duration-300 shadow-sm"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">{cat.description}</p>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-emerald-600 group-hover:translate-x-1 transition-transform">
                  <span>Explore Directory</span>
                  <span>→</span>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/categories"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              View All Service Categories →
            </Link>
          </div>
        </div>
      </section>

      {/* 4. For Workers Section */}
      <section className="py-16 px-4 border-b border-gray-200/80 bg-gradient-to-b from-slate-50 via-emerald-50/40 to-slate-50">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              For Skilled Professionals
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              Are you a skilled worker?
            </h2>
            <p className="text-gray-600 text-base leading-relaxed">
              Create your free profile and help customers find your services online. Sromojibi empowers mistris, technicians, and local trade specialists to gain direct visibility in their community.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm pt-2">
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span> Free listing
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span> More customer reach
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span> Build your reputation
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <span className="text-emerald-600 font-bold">✓</span> Get discovered locally
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/join-worker"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-base shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                Register Free
              </Link>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-white border border-gray-200/80 space-y-6 shadow-xl relative">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4">
              <span className="text-sm font-semibold text-gray-700">Worker Directory Preview</span>
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">Free Listing</span>
            </div>
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-slate-50 border border-gray-200/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg shrink-0">
                  ⚡
                </div>
                <div>
                  <div className="font-bold text-gray-900">Electrician Profile</div>
                  <div className="text-xs text-gray-500">Wiring, Switchboard & Appliance Repairs</div>
                  <div className="text-xs text-emerald-700 font-medium mt-1">📍 Dhaka Division • 5+ Years Exp</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-gray-200/80 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg shrink-0">
                  🏠
                </div>
                <div>
                  <div className="font-bold text-gray-900">Rajmistri Profile</div>
                  <div className="text-xs text-gray-500">Brickwork, Plaster & Roof Slab Work</div>
                  <div className="text-xs text-emerald-700 font-medium mt-1">📍 Mymensingh • Verified Listing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. For Customers Section */}
      <section className="py-16 px-4 border-b border-gray-200/80 bg-white">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-cyan-100 text-cyan-800 text-xs font-semibold uppercase tracking-wider">
              For Homeowners & Businesses
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">Need a worker?</h2>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              Soon you can search skilled professionals easily by your specific requirements:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 text-left space-y-2 hover:shadow-md transition-all">
              <div className="text-2xl text-emerald-600">📍</div>
              <h3 className="font-bold text-gray-900 text-base">✓ Location</h3>
              <p className="text-xs text-gray-500">Discover skilled mistris in your district or neighborhood.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 text-left space-y-2 hover:shadow-md transition-all">
              <div className="text-2xl text-teal-600">🛠️</div>
              <h3 className="font-bold text-gray-900 text-base">✓ Service Type</h3>
              <p className="text-xs text-gray-500">Filter by exact job needs like plumbing, wiring, or tiling.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 text-left space-y-2 hover:shadow-md transition-all">
              <div className="text-2xl text-cyan-600">⭐</div>
              <h3 className="font-bold text-gray-900 text-base">✓ Experience</h3>
              <p className="text-xs text-gray-500">Check trade background and years of local experience.</p>
            </div>
            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 text-left space-y-2 hover:shadow-md transition-all">
              <div className="text-2xl text-emerald-600">💬</div>
              <h3 className="font-bold text-gray-900 text-base">✓ Customer Reviews</h3>
              <p className="text-xs text-gray-500">Read honest feedback from neighbors before contacting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Launch Area Section */}
      <section className="py-16 px-4 border-b border-gray-200/80 bg-slate-50">
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="space-y-3">
            <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              SEO Coverage
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Launching first in Bangladesh</h2>
            <p className="text-gray-600 text-base max-w-xl mx-auto">
              Building directory listings for primary economic centers and major divisions.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {cities.map((city) => (
              <Link
                key={city.slug}
                href={`/workers/${city.slug}`}
                className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-emerald-500/50 hover:shadow-md transition-all text-center group"
              >
                <div className="text-2xl mb-2">🏙️</div>
                <div className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">{city.name}</div>
                <div className="text-[10px] uppercase font-semibold tracking-wider text-emerald-700 mt-1">
                  {city.count}
                </div>
              </Link>
            ))}
          </div>

          <div className="pt-2">
            <Link
              href="/locations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-600 hover:text-emerald-700 hover:underline"
            >
              Explore All Supported Locations →
            </Link>
          </div>
        </div>
      </section>

      {/* Early Access Notification Form */}
      <section id="notify-section" className="py-16 px-4 border-b border-gray-200/80 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">Stay Updated on Sromojibi Launch</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Get notified when directory listings go live in your district or city.
          </p>

          <NotifyForm />
        </div>
      </section>

      {/* 7. FAQ Section (SEO) */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-sm">Everything you need to know about Sromojibi worker directory</p>
          </div>

          <HomeFaqAccordion faqs={faqs} />
        </div>
      </section>
    </main>
  );
}
