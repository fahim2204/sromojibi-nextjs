import Link from "next/link";
import { Metadata } from "next";

type Props = {
  params: { slug: string };
};

export async function generateStaticParams() {
  return [
    { slug: "rajmistri" },
    { slug: "plumber" },
    { slug: "tiles-worker" },
    { slug: "painter" },
    { slug: "carpenter" },
    { slug: "ac-technician" },
    { slug: "cctv-installer" },
    { slug: "chittagong" },
    { slug: "sylhet" },
    { slug: "rajshahi" },
    { slug: "khulna" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const formattedTitle = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${formattedTitle} Workers Directory in Bangladesh`,
    description: `Discover local ${formattedTitle} workers, mistris, and technicians in Bangladesh. Sromojibi is building Bangladesh's largest open worker directory.`,
    alternates: {
      canonical: `/workers/${params.slug}`,
    },
  };
}

export default function WorkerSlugPage({ params }: Props) {
  const formattedTitle = params.slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Link href="/workers" className="hover:underline">Workers Directory</Link>
            <span>/</span>
            <span className="capitalize">{formattedTitle}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-white">
            <span className="text-emerald-400">{formattedTitle}</span> Worker Listings
          </h1>

          <p className="text-gray-300 text-base md:text-lg max-w-3xl">
            Directory listings and profiles for {formattedTitle} in Bangladesh. Browse experienced trade specialists and technicians near you.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-gray-900 border border-gray-800 space-y-6 text-center">
          <div className="text-4xl">🛠️</div>
          <h2 className="text-2xl font-bold text-white">Listings Initializing</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Sromojibi is actively building directory listings for {formattedTitle} across Bangladesh.
          </p>

          <div className="pt-2">
            <Link
              href="/join-worker"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all"
            >
              Are you a {formattedTitle}? Register Your Profile Free
            </Link>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link href="/workers" className="text-xs font-semibold text-gray-400 hover:text-emerald-400">
            ← Back to All Workers Directory
          </Link>
        </div>
      </div>
    </main>
  );
}
