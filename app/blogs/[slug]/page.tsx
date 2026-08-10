import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/blogPosts";

type BlogPageProps = {
  params: {
    slug: string;
  };
};

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export const dynamic = "force-static";

export function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export function generateMetadata({ params }: BlogPageProps): Metadata {
  const post = getBlogPost(params.slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
    };
  }

  const url = `${siteUrl}/blogs/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url,
      siteName: "Sromojibi",
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPostPage({ params }: BlogPageProps) {
  const post = getBlogPost(params.slug);

  if (!post) {
    notFound();
  }

  const url = `${siteUrl}/blogs/${post.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      url,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Organization",
        name: "Sromojibi",
        url: siteUrl,
      },
      publisher: {
        "@type": "Organization",
        name: "Sromojibi",
        url: siteUrl,
      },
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": url,
      },
      keywords: post.keywords.join(", "),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteUrl,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blogs",
          item: `${siteUrl}/blogs`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: url,
        },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: post.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-4xl mx-auto space-y-10">
        <header className="border-b border-gray-200 pb-8 space-y-4">
          <Link
            href="/blogs"
            className="inline-block text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
          >
            ← Back to Worker Guides
          </Link>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
              {post.category}
            </span>
            <span>·</span>
            <span>{post.readingTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 leading-tight">
            {post.title}
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed">{post.description}</p>
        </header>

        <div className="space-y-8 text-gray-700 leading-relaxed">
          <p className="text-lg text-gray-800">{post.intro}</p>

          <div className="space-y-8">
            {post.sections.map((section) => (
              <section key={section.heading} className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900 border-l-4 border-emerald-500 pl-4">
                  {section.heading}
                </h2>
                <div className="space-y-3 text-base text-gray-700">
                  {section.body.map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="p-6 rounded-2xl bg-white border border-gray-200 space-y-3 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900">Need a worker in this field?</h3>
            <p className="text-sm text-gray-600">
              Find verified trade professionals and skilled technicians in your area on Sromojibi.
            </p>
            <Link
              href={post.relatedCategory.href}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
            >
              Explore {post.relatedCategory.label} →
            </Link>
          </section>

          {post.faqs.length > 0 && (
            <section className="space-y-4 pt-4 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {post.faqs.map((faq) => (
                  <details
                    key={faq.question}
                    className="group p-5 rounded-2xl bg-white border border-gray-200 shadow-sm"
                  >
                    <summary className="cursor-pointer font-semibold text-gray-900 group-open:text-emerald-600 transition-colors">
                      {faq.question}
                    </summary>
                    <p className="mt-3 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-3">
                      {faq.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          )}
        </div>
      </article>
    </main>
  );
}
