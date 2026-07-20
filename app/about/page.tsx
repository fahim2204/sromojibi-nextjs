import Link from "next/link";

export const metadata = {
  title: "About Us",
  description:
    "Learn about Sromojibi's mission to build Bangladesh's largest open worker directory connecting local skilled workers with customers.",
  alternates: {
    canonical: "/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Our Mission
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">About Sromojibi</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Discover skilled workers across Bangladesh effortlessly.
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 md:p-12 space-y-8 shadow-xl">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Building Bangladesh&apos;s Worker Directory</h2>
            <p className="text-gray-300 leading-relaxed text-base">
              Every day, millions of skilled professionals — from electricians and plumbers to tiles mistris and painters — perform vital work in communities across Bangladesh. However, finding reliable local technicians often relies solely on personal contacts and word-of-mouth.
            </p>
            <p className="text-gray-300 leading-relaxed text-base">
              Sromojibi was founded to bridge this gap. We are building a public, open worker directory that helps homeowners and local businesses discover skilled trade professionals in their own cities and neighborhoods.
            </p>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-800">
            <h2 className="text-2xl font-bold text-white">Core Principles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
                <h3 className="font-bold text-emerald-400 text-lg mb-1">🔍 Open Discovery</h3>
                <p className="text-sm text-gray-400">
                  Making worker profiles indexed, searchable, and easily reachable for local households.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
                <h3 className="font-bold text-emerald-400 text-lg mb-1">🆓 Free Worker Profiles</h3>
                <p className="text-sm text-gray-400">
                  Worker listings will be free during our initial launch period to maximize opportunity for all skilled mistris.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
                <h3 className="font-bold text-emerald-400 text-lg mb-1">📍 Local Focus</h3>
                <p className="text-sm text-gray-400">
                  Organized by division, city, and trade category for maximum relevance and fast contact.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-gray-950 border border-gray-800">
                <h3 className="font-bold text-emerald-400 text-lg mb-1">🛡️ Directory Model</h3>
                <p className="text-sm text-gray-400">
                  Providing transparent profile information for direct connection without middleman barriers.
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4 pt-4 border-t border-gray-800">
            <h2 className="text-2xl font-bold text-white">Are You a Skilled Professional?</h2>
            <p className="text-gray-300 text-base leading-relaxed">
              If you offer skilled home or trade services, register your free profile today to get discovered by local customers.
            </p>
            <div>
              <Link
                href="/join-worker"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm transition-all"
              >
                Register Free Profile →
              </Link>
            </div>
          </section>
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="text-gray-400 hover:text-emerald-400 text-sm font-semibold transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
