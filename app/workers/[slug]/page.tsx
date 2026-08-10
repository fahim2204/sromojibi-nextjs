import Link from "next/link";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import WorkerReviewSection from "@/components/WorkerReviewSection";

type Props = {
  params: { slug: string };
};

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({ select: { slug: true } });
    const locations = await prisma.location.findMany({ select: { slug: true } });
    const workers = await prisma.workerProfile.findMany({
      where: { status: "APPROVED" },
      select: { slug: true },
    });

    const categoryParams = categories.map((c) => ({ slug: c.slug }));
    const locationParams = locations.map((l) => ({ slug: l.slug }));
    const workerParams = workers.map((w) => ({ slug: w.slug }));

    return [...categoryParams, ...locationParams, ...workerParams];
  } catch (error) {
    return [
      { slug: "electrician" },
      { slug: "plumber" },
      { slug: "rajmistri" },
      { slug: "dhaka" },
    ];
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const formattedTitle = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedTitle} Workers Directory in Bangladesh | Sromojibi`,
    description: `Discover local ${formattedTitle} workers, mistris, and technicians in Bangladesh. Contact verified specialists directly on Sromojibi.`,
    alternates: {
      canonical: `/workers/${params.slug}`,
    },
  };
}

export default async function WorkerSlugPage({ params }: Props) {
  const slug = params.slug.toLowerCase();

  // 1. Check if slug matches a Category
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  // 2. Check if slug matches a Location
  const location = await prisma.location.findUnique({
    where: { slug },
  });

  // 3. Check if slug matches a specific Worker Profile
  const singleWorker = await prisma.workerProfile.findUnique({
    where: { slug },
    include: {
      category: true,
      location: true,
      reviews: true,
    },
  });

  // If single worker profile exists, render detail view
  if (singleWorker) {
    return (
      <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Link href="/workers" className="hover:underline">Workers Directory</Link>
            <span>/</span>
            <span className="capitalize">{singleWorker.service_type}</span>
            <span>/</span>
            <span className="text-gray-300">{singleWorker.full_name}</span>
          </div>

          <div className="p-8 rounded-3xl bg-gray-900 border border-gray-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl font-black text-white">{singleWorker.full_name}</h1>
                  {singleWorker.is_verified && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      ✓ Verified Worker
                    </span>
                  )}
                </div>
                <p className="text-sm text-emerald-400 font-semibold">
                  {singleWorker.category?.icon ?? "🛠️"} {singleWorker.service_type} • {singleWorker.city}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${singleWorker.phone}`}
                  className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold text-sm transition-all flex items-center gap-2 shadow-lg shadow-emerald-950/50"
                >
                  📞 Call {singleWorker.phone}
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
              <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
                <p className="text-xs text-gray-400">Experience</p>
                <p className="font-bold text-white text-base mt-1">{singleWorker.experience}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
                <p className="text-xs text-gray-400">City / Division</p>
                <p className="font-bold text-white text-base mt-1">{singleWorker.city}</p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
                <p className="text-xs text-gray-400">Rating</p>
                <p className="font-bold text-yellow-400 text-base mt-1">
                  ★ {Number(singleWorker.rating ?? 5.0).toFixed(1)}
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-gray-950/60 border border-gray-800">
                <p className="text-xs text-gray-400">Reviews</p>
                <p className="font-bold text-white text-base mt-1">{singleWorker.review_count} Customer Feedback</p>
              </div>
            </div>

            {singleWorker.details && (
              <div className="space-y-2 pt-2">
                <h3 className="font-bold text-white text-base">Services & Specialty Summary</h3>
                <p className="text-sm text-gray-300 leading-relaxed bg-gray-950/40 p-4 rounded-2xl border border-gray-800/80">
                  {singleWorker.details}
                </p>
              </div>
            )}

            <WorkerReviewSection
              workerSlug={singleWorker.slug}
              initialReviews={singleWorker.reviews}
            />

            <div className="pt-4 flex items-center justify-between border-t border-gray-800">
              <Link href="/workers" className="text-xs font-semibold text-gray-400 hover:text-emerald-400">
                ← Back to All Workers Directory
              </Link>
              <Link href="/join-worker" className="text-xs font-semibold text-emerald-400 hover:underline">
                Register as a Worker →
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // Fetch list of workers matching category OR location OR service_type/city string
  let pageTitle = category?.name ?? location?.name ?? params.slug.replace(/-/g, " ");
  let icon = category?.icon ?? (location ? "🏙️" : "🛠️");

  const workers = await prisma.workerProfile.findMany({
    where: {
      status: "APPROVED",
      OR: [
        { fk_category_id: category?.id ?? -1 },
        { fk_location_id: location?.id ?? -1 },
        { service_type: { equals: pageTitle, mode: "insensitive" } },
        { city: { equals: pageTitle, mode: "insensitive" } },
      ],
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Link href="/workers" className="hover:underline">Workers Directory</Link>
            <span>/</span>
            <span className="capitalize">{pageTitle}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white flex items-center gap-3">
            <span>{icon}</span>
            <span className="capitalize text-emerald-400">{pageTitle}</span> Worker Listings
          </h1>

          <p className="text-gray-300 text-base md:text-lg max-w-3xl">
            {category?.description ??
              location?.description ??
              `Explore experienced ${pageTitle} mistris and technicians across Bangladesh.`}
          </p>
        </div>

        {workers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workers.map((worker) => (
              <div
                key={worker.id}
                className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/40 transition-all space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <Link href={`/workers/${worker.slug}`} className="group">
                        <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">
                          {worker.full_name}
                        </h3>
                      </Link>
                      <p className="text-xs text-emerald-400 font-medium">
                        {worker.service_type} • {worker.city}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-300 text-xs font-semibold shrink-0">
                      {worker.experience}
                    </span>
                  </div>

                  {worker.details && (
                    <p className="text-xs text-gray-400 line-clamp-3">
                      {worker.details}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-800 flex items-center justify-between">
                  <span className="text-xs text-yellow-400 font-bold">
                    ★ {Number(worker.rating ?? 5.0).toFixed(1)}
                  </span>
                  <a
                    href={`tel:${worker.phone}`}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-extrabold text-xs transition-all"
                  >
                    📞 Call Mistri
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 rounded-3xl bg-gray-900 border border-gray-800 space-y-6 text-center">
            <div className="text-4xl">🛠️</div>
            <h2 className="text-2xl font-bold text-white">Listings Initializing for {pageTitle}</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Sromojibi is actively registering profiles for {pageTitle} across Bangladesh.
            </p>

            <div className="pt-2">
              <Link
                href="/join-worker"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all"
              >
                Are you a {pageTitle}? Register Free Profile
              </Link>
            </div>
          </div>
        )}

        <div className="text-center pt-4">
          <Link href="/workers" className="text-xs font-semibold text-gray-400 hover:text-emerald-400">
            ← Back to All Workers Directory
          </Link>
        </div>
      </div>
    </main>
  );
}
