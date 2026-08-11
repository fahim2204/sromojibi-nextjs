import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPosts } from "@/lib/blogPosts";

export const dynamic = "force-dynamic";

// Stable lastmod timestamp to prevent search engine re-indexing churn
const LAST_MODIFIED = "2026-08-11T00:00:00.000Z";

function toSlug(name: string | null): string {
  if (!name) return "all";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

  // Clean raw parameter (e.g. "barguna-10.xml" -> "barguna-10")
  const rawId = params.id.replace(/\.xml$/, "");

  let entries: { url: string; lastmod: string; changefreq: string; priority: string }[] = [];

  // Main sitemap ("main-00", "main-000", or "0")
  if (rawId === "main-00" || rawId === "main-000" || rawId === "0") {
    const staticRoutes = [
      "",
      "/workers",
      "/categories",
      "/locations",
      "/about",
      "/join-worker",
      "/contact",
      "/guides",
    ];

    entries.push(
      ...staticRoutes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastmod: LAST_MODIFIED,
        changefreq: route === "" ? "daily" : "weekly",
        priority: route === "" ? "1.0" : "0.8",
      }))
    );

    entries.push(
      ...blogPosts.map((post) => ({
        url: `${baseUrl}/guides/${post.slug}`,
        lastmod: new Date(post.updatedAt || post.publishedAt).toISOString(),
        changefreq: "weekly",
        priority: "0.7",
      }))
    );

    try {
      const categories = await prisma.category.findMany({
        where: { is_active: true },
        select: { slug: true },
      });

      entries.push(
        ...categories.map((cat) => ({
          url: `${baseUrl}/categories/${cat.slug}`,
          lastmod: LAST_MODIFIED,
          changefreq: "weekly",
          priority: "0.8",
        }))
      );

      const approvedWorkers = await prisma.workerProfile.findMany({
        where: { status: "APPROVED" },
        select: { slug: true, updated_at: true },
      });

      entries.push(
        ...approvedWorkers.map((w) => ({
          url: `${baseUrl}/workers/${w.slug}`,
          lastmod: new Date(w.updated_at).toISOString(),
          changefreq: "weekly",
          priority: "0.9",
        }))
      );
    } catch (err) {
      console.error("Error fetching categories and workers for main sitemap:", err);
    }
  } else {
    // Extract district slug (e.g. "barguna-10" -> "barguna", "coxs-bazar-23" -> "coxs-bazar")
    const districtSlug = rawId.replace(/-\d+$/, "");

    try {
      const districts = await prisma.district.findMany({
        include: {
          upazilas: true,
        },
      });

      const matchingDistrict = districts.find(
        (d) => toSlug(d.title_en || d.title_bn) === districtSlug
      );

      if (matchingDistrict) {
        const distSlug = toSlug(matchingDistrict.title_en || matchingDistrict.title_bn);

        // District URL: /locations/[district]
        entries.push({
          url: `${baseUrl}/locations/${distSlug}`,
          lastmod: LAST_MODIFIED,
          changefreq: "weekly",
          priority: "0.8",
        });

        // Upazila URLs: /locations/[district]/[upazila]
        entries.push(
          ...matchingDistrict.upazilas.map((upz) => ({
            url: `${baseUrl}/locations/${distSlug}/${toSlug(upz.title_en || upz.title_bn)}`,
            lastmod: LAST_MODIFIED,
            changefreq: "weekly",
            priority: "0.7",
          }))
        );
      }
    } catch (err) {
      console.error(`Error fetching district sitemap for ${rawId}:`, err);
    }
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${e.url}</loc>
    <lastmod>${e.lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new NextResponse(sitemapXml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
