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

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

  let sitemapNames: string[] = ["main-00"];

  try {
    const districts = await prisma.district.findMany({
      select: { title_en: true, title_bn: true },
      orderBy: { title_en: "asc" },
    });

    districts.forEach((dist, idx) => {
      const slug = toSlug(dist.title_en || dist.title_bn);
      const rand2 = String(10 + ((idx + 1) % 90)).padStart(2, "0");
      sitemapNames.push(`${slug}-${rand2}`);
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
