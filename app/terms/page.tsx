import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service for Sromojibi. Read the terms, conditions, and directory platform policies.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-3 border-b border-gray-800 pb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
            Legal & Terms
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white">Terms of Service</h1>
          <p className="text-gray-400 text-sm">
            Last Updated: July 2026
          </p>
        </div>

        <div className="space-y-8 text-gray-300">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-white">1. Platform Nature (Open Directory)</h2>
            <p className="text-base leading-relaxed">
              <strong>Sromojibi</strong> (sromojibi.com) operates as an open local worker directory designed to help users discover independent skilled workers, mistris, and technicians in Bangladesh.
            </p>
            <div className="p-4 rounded-2xl bg-gray-900 border border-gray-800 text-emerald-400 text-xs sm:text-sm font-medium">
              💡 <strong>Directory Notice:</strong> Sromojibi is not a labor marketplace, contractor, or employment agency. We do not hire, employ, or manage workers listed on the site.
            </div>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-800/80">
            <h2 className="text-2xl font-bold text-white">2. Direct Connection & Independent Contracting</h2>
            <p className="text-base leading-relaxed">
              Any service agreements, work contracts, pricing, payment terms, or job specifications arranged between customers and listed workers are made directly between those parties. Sromojibi is not a party to employment contracts, service transactions, or financial exchanges.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-800/80">
            <h2 className="text-2xl font-bold text-white">3. Disclaimer of Warranties & Dispute Liability</h2>
            <p className="text-base leading-relaxed">
              Sromojibi provides directory listings on an &quot;as-is&quot; basis for discovery purposes. While we encourage accurate profiles, Sromojibi does not guarantee worker performance, trade licenses, or individual work quality. Sromojibi is not liable for payment disputes, job delays, damages, or contract disagreements.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-800/80">
            <h2 className="text-2xl font-bold text-white">4. Worker Conduct & Free Profile Guidelines</h2>
            <p className="text-base leading-relaxed">
              Workers registering a free profile agree to provide truthful contact and service details. Sromojibi reserves the right to suspend or remove any profile that violates platform community standards, contains false information, or engages in fraudulent activity.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-800/80">
            <h2 className="text-2xl font-bold text-white">5. Changes to Terms</h2>
            <p className="text-base leading-relaxed">
              We reserve the right to update these terms as platform capabilities expand. Continued use of Sromojibi constitutes acceptance of updated terms.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-800/80">
            <h2 className="text-2xl font-bold text-white">6. Contact Information</h2>
            <p className="text-base leading-relaxed">
              If you have any questions regarding our Terms of Service, please contact us at{" "}
              <a href="mailto:contact@sromojibi.com" className="text-emerald-400 font-semibold hover:underline">
                contact@sromojibi.com
              </a>.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-gray-800/80">
          <Link href="/" className="text-sm font-semibold text-gray-400 hover:text-emerald-400 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
