import React from "react";
import Link from "next/link";
import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the Sromojibi team for worker directory inquiries, listing support, partnership, or general feedback.",
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
  openGraph: {
    title: "Contact Sromojibi Worker Directory",
    description:
      "Get in touch with the Sromojibi team for worker directory inquiries, listing support, partnership, or general feedback.",
    url: `${siteUrl}/contact`,
    siteName: "Sromojibi",
  },
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">Contact Us</h1>
          <p className="text-gray-600 text-base max-w-xl mx-auto">
            We&apos;d love to hear from workers, customers, and partners across Bangladesh.
          </p>
        </div>

        <div className="p-8 sm:p-10 rounded-3xl bg-white border border-gray-200 shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                Have questions about worker listings, suggest a new skill category, or need help updating your profile? Reach out to our support team and we will respond as soon as possible.
              </p>

              <div className="space-y-4 pt-2">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📧</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Email Support</h3>
                    <a
                      href="mailto:contact@sromojibi.com"
                      className="text-emerald-600 hover:text-emerald-700 text-sm font-medium transition-colors"
                    >
                      contact@sromojibi.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-sm">Location</h3>
                    <p className="text-gray-500 text-xs">Dhaka, Bangladesh</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-gray-200 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Send Us a Direct Email</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                For worker registration assistance, partnerships, or directory inquiries, email our team directly:
              </p>
              <a
                href="mailto:contact@sromojibi.com"
                className="block w-full text-center py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
              >
                Email contact@sromojibi.com
              </a>
            </div>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="text-sm text-gray-600 hover:text-emerald-600 transition-colors">
            ← Back to Homepage
          </Link>
        </div>
      </div>
    </main>
  );
}
