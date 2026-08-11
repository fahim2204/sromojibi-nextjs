import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Stable lastmod timestamp to prevent search engine re-indexing churn
const LAST_MODIFIED = "2026-08-11T00:00:00.000Z";

function toSlug(name: string | null): string {
  if (!name) return "district";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Deterministic 2-digit hash suffix derived directly from the district slug name
function getSlugSuffix(slug: string): string {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) & 0x7fffffff;
  }
  const num = 10 + (hash % 90);
  return String(num).padStart(2, "0");
}

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

  let sitemapNames: string[] = ["main-00"];
  const seenSlugs = new Set<string>();

  try {
    const districts = await prisma.district.findMany({
      select: { id: true, title_en: true, title_bn: true },
      orderBy: { title_en: "asc" },
    });

    districts.forEach((dist) => {
      let slug = toSlug(dist.title_en || dist.title_bn);

      // Duplicate Slug Protection: Append suffix counter if duplicate slug exists
      if (seenSlugs.has(slug)) {
        let counter = 2;
        while (seenSlugs.has(`${slug}-${counter}`)) {
          counter++;
        }
        slug = `${slug}-${counter}`;
      }

      seenSlugs.add(slug);
      const suffix = getSlugSuffix(slug);
      sitemapNames.push(`${slug}-${suffix}`);
    });
  } catch (error) {
    console.error("Error fetching districts for sitemap index:", error);
  }

  const sitemapIndexXml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapNames
  .map(
    (name) => `  <sitemap>
    <loc>${baseUrl}/sitemap/${name}.xml</loc>
    <lastmod>${LAST_MODIFIED}</lastmod>
  </sitemap>`
  )
  .join("\n")}
</sitemapindex>`;

  return new NextResponse(sitemapIndexXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
