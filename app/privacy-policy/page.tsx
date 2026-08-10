import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Sromojibi worker directory. Learn how we collect, protect, and handle worker and visitor data.",
  alternates: {
    canonical: "/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4">
      <div className="max-w-3xl mx-auto space-y-10">
        <div className="space-y-3 border-b border-gray-200 pb-8">
          <div className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            Legal & Compliance
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">
            Last Updated: July 2026
          </p>
        </div>

        <div className="space-y-8 text-gray-700">
          <section className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900">1. Introduction</h2>
            <p className="text-base leading-relaxed">
              Welcome to <strong>Sromojibi</strong> (sromojibi.com). We are committed to safeguarding the privacy of our visitors, local workers, and service seekers across Bangladesh. This Privacy Policy explains how information is collected, used, and protected when you access our worker directory platform.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">2. Information We Collect</h2>
            <p className="text-base leading-relaxed">
              Sromojibi operates as an open discovery directory. We collect information in the following ways:
            </p>
            <ul className="list-disc list-inside space-y-2 text-base pl-2 text-gray-700">
              <li>
                <strong className="text-gray-900">Worker Profile Data:</strong> When a skilled worker voluntarily registers a profile, we collect details such as full name, phone number, trade category (e.g., electrician, plumber, rajmistri), city/district location, and work experience to display in our public directory.
              </li>
              <li>
                <strong className="text-gray-900">Usage & Analytics Data:</strong> We may collect non-identifiable technical data such as browser type, device info, IP address, and pages visited to improve platform performance and user experience.
              </li>
              <li>
                <strong className="text-gray-900">Notification Requests:</strong> When users sign up for launch notifications, we collect their email address solely to send service updates.
              </li>
            </ul>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">3. How Information is Used</h2>
            <p className="text-base leading-relaxed">
              Information submitted to Sromojibi is used exclusively to:
            </p>
            <ul className="list-disc list-inside space-y-1.5 text-base pl-2 text-gray-700">
              <li>Publish public worker directory listings for local customer discovery.</li>
              <li>Connect homeowners and local businesses with nearby trade specialists.</li>
              <li>Improve platform search functionality, navigation, and location coverage.</li>
              <li>Communicate platform launch updates and directory features.</li>
            </ul>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">4. Public Directory Visibility</h2>
            <p className="text-base leading-relaxed">
              By submitting a profile as a worker, you acknowledge that your contact name, trade category, location, and phone number are intended to be publicly discoverable so local customers can contact you directly for service inquiries.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">5. Cookies & Analytics</h2>
            <p className="text-base leading-relaxed">
              We may use cookies or local browser storage to remember user preferences and measure site traffic. You can choose to disable cookies through your browser settings without restricting core directory access.
            </p>
          </section>

          <section className="space-y-3 pt-6 border-t border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">6. Contact & Data Profile Management</h2>
            <p className="text-base leading-relaxed">
              If you wish to update or remove your worker profile listing from Sromojibi, please reach out to us at{" "}
              <a href="mailto:contact@sromojibi.com" className="text-emerald-600 font-semibold hover:underline">
                contact@sromojibi.com
              </a>.
            </p>
          </section>
        </div>

        <div className="pt-8 border-t border-gray-200">
          <Link href="/" className="text-sm font-semibold text-gray-600 hover:text-emerald-600 transition-colors">
            ← Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
