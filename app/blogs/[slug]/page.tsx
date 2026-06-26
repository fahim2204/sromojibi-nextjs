import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { blogPosts, getBlogPost } from "@/lib/blogPosts";

type BlogPageProps = {
  params: {
    slug: string;
  };
};

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

  const url = `https://ezcalc.xyz/blogs/${post.slug}`;

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
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: ["EZCalc"],
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

  const url = `https://ezcalc.xyz/blogs/${post.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      image: "https://ezcalc.xyz/images/ezcalc.webp",
      url,
      datePublished: post.publishedAt,
      dateModified: post.updatedAt,
      author: {
        "@type": "Organization",
        name: "EZCalc",
        url: "https://ezcalc.xyz",
      },
      publisher: {
        "@type": "Organization",
        name: "EZCalc",
        logo: {
          "@type": "ImageObject",
          url: "https://ezcalc.xyz/icon.png",
        },
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
          item: "https://ezcalc.xyz",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Blogs",
          item: "https://ezcalc.xyz/blogs",
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
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article>
        <header className="border-b border-gray-200 bg-white px-4 py-12 dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto max-w-3xl">
            <Link
              href="/blogs"
              className="mb-5 inline-block text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Calculator guides
            </Link>
            <p className="mb-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              {post.category} · {post.readingTime} · Updated {formatDate(post.updatedAt)}
            </p>
            <h1 className="text-4xl font-extrabold leading-tight text-gray-950 dark:text-white md:text-5xl">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-8 text-gray-600 dark:text-gray-400">
              {post.description}
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-4 py-10">
          <p className="mb-8 text-lg leading-8 text-gray-700 dark:text-gray-300">
            {post.intro}
          </p>

          <div className="space-y-10">
            {post.sections.map((section) => (
              <section key={section.heading}>
                <h2 className="mb-4 text-2xl font-bold text-gray-950 dark:text-white">
                  {section.heading}
                </h2>
                <div className="space-y-4 text-base leading-8 text-gray-700 dark:text-gray-300">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <section className="mt-10 rounded-lg border border-blue-200 bg-blue-50 p-6 dark:border-blue-900/60 dark:bg-blue-950/30">
            <h2 className="mb-3 text-xl font-bold text-gray-950 dark:text-white">
              Try the calculator
            </h2>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Want to run the numbers without doing the math by hand? Open the related
              tool and check your result in seconds.
            </p>
            <Link
              href={post.relatedCalculator.href}
              className="inline-flex rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Open {post.relatedCalculator.label}
            </Link>
          </section>

          <section className="mt-10">
            <h2 className="mb-5 text-2xl font-bold text-gray-950 dark:text-white">
              Quick answers
            </h2>
            <div className="space-y-4">
              {post.faqs.map((faq) => (
                <details
                  key={faq.question}
                  className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
                >
                  <summary className="cursor-pointer font-semibold text-gray-950 dark:text-white">
                    {faq.question}
                  </summary>
                  <p className="mt-3 leading-7 text-gray-700 dark:text-gray-300">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </article>
    </main>
  );
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
}
