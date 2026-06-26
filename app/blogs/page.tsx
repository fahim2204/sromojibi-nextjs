import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blogPosts";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Calculator Guides and Practical Math Articles",
  description:
    "Helpful calculator guides for age, BMI, calories, loans, mortgages, percentages, tips, gold, and land measurements.",
  alternates: {
    canonical: "https://ezcalc.xyz/blogs",
  },
  openGraph: {
    title: "Calculator Guides and Practical Math Articles",
    description:
      "Helpful calculator guides for everyday math, health, finance, gold, and measurement decisions.",
    url: "https://ezcalc.xyz/blogs",
    type: "website",
  },
};

export default function BlogsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "EZCalc Calculator Guides",
    description: metadata.description,
    url: "https://ezcalc.xyz/blogs",
    mainEntity: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `https://ezcalc.xyz/blogs/${post.slug}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Organization",
        name: "EZCalc",
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="border-b border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-5xl">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            EZCalc Blog
          </p>
          <h1 className="max-w-3xl text-4xl font-extrabold text-gray-950 dark:text-white md:text-5xl">
            Calculator guides for everyday decisions
          </h1>
          <p className="mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
            Clear, practical articles that explain the numbers behind health, finance,
            property, gold, and daily math calculators.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl grid-cols-1 gap-5 px-4 py-10 md:grid-cols-2">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm transition-colors hover:border-blue-400 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-blue-500"
          >
            <p className="mb-3 text-sm font-medium text-blue-600 dark:text-blue-400">
              {post.category} · {post.readingTime}
            </p>
            <h2 className="mb-3 text-2xl font-bold text-gray-950 dark:text-white">
              <Link href={`/blogs/${post.slug}`} className="hover:text-blue-600 dark:hover:text-blue-400">
                {post.title}
              </Link>
            </h2>
            <p className="mb-5 text-gray-600 dark:text-gray-400">{post.description}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href={`/blogs/${post.slug}`}
                className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Read guide
              </Link>
              <Link
                href={post.relatedCalculator.href}
                className="text-gray-600 hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
              >
                Open {post.relatedCalculator.label}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
