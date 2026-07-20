import type { Metadata } from "next";
import Link from "next/link";
import { blogPosts } from "@/lib/blogPosts";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Worker Guides & Home Maintenance Articles",
  description:
    "Helpful guides on hiring electricians, plumbers, rajmistris, tiles workers, and trade specialists in Bangladesh.",
  alternates: {
    canonical: `${siteUrl}/blogs`,
  },
  openGraph: {
    title: "Worker Guides & Home Maintenance Articles | Sromojibi",
    description:
      "Helpful guides on hiring electricians, plumbers, rajmistris, tiles workers, and trade specialists in Bangladesh.",
    url: `${siteUrl}/blogs`,
    siteName: "Sromojibi",
    type: "website",
  },
};

export default function BlogsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Sromojibi Worker & Trade Guides",
    description: metadata.description,
    url: `${siteUrl}/blogs`,
    mainEntity: blogPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url: `${siteUrl}/blogs/${post.slug}`,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Organization",
        name: "Sromojibi",
      },
    })),
  };

  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 py-16 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="max-w-5xl mx-auto mb-12 text-center space-y-3">
        <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          Sromojibi Knowledge Base
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white">
          Worker Guides & Home Maintenance Tips
        </h1>
        <p className="text-gray-400 text-base max-w-2xl mx-auto">
          Practical articles explaining how to choose, inspect, and work with skilled trade professionals across Bangladesh.
        </p>
      </section>

      <section className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogPosts.map((post) => (
          <article
            key={post.slug}
            className="p-6 rounded-2xl bg-gray-900 border border-gray-800 hover:border-emerald-500/50 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs text-emerald-400 font-semibold mb-3">
                <span>{post.category}</span>
                <span>{post.readingTime}</span>
              </div>
              <h2 className="text-xl font-bold text-white mb-3 hover:text-emerald-400 transition-colors">
                <Link href={`/blogs/${post.slug}`}>{post.title}</Link>
              </h2>
              <p className="text-sm text-gray-400 leading-relaxed mb-6">{post.description}</p>
            </div>

            <div className="flex items-center justify-between border-t border-gray-800 pt-4 text-xs font-semibold">
              <Link
                href={`/blogs/${post.slug}`}
                className="text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                Read full article →
              </Link>
              <Link
                href={post.relatedCategory.href}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {post.relatedCategory.label}
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
