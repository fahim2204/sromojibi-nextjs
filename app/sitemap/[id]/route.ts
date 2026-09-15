import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { blogPosts } from "@/lib/blogPosts";

export const dynamic = "force-dynamic";

// ============================================================================
// CONSTANTS & HELPERS
// ============================================================================

// Stable lastmod timestamp to prevent search engine re-indexing churn
const LAST_MODIFIED = "2026-08-11T00:00:00.000Z";

/**
 * Normalizes location / entity names to clean URL slugs.
 */
function toSlug(name: string | null | undefined): string {
  if (!name) return "all";
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

// ============================================================================
// ROUTE HANDLER: GET /sitemap/[id]
// Handles both "main-00" and individual district sitemaps (e.g. "dhaka-42")
// ============================================================================
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

  // Clean raw parameter (e.g. "barguna-10.xml" -> "barguna-10")
  const rawId = params.id.replace(/\.xml$/, "");

  let entries: SitemapEntry[] = [];

  // ==========================================================================
  // SECTION 1: MAIN SITEMAP (main-00, main-000, 0)
  // Static pages, Blog/Guides, Categories, and Approved Workers
  // ==========================================================================
  if (rawId === "main-00" || rawId === "main-000" || rawId === "0") {
    // 1. Core Static Application Pages
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

    // 2. Guides / Blog Posts
    entries.push(
      ...blogPosts.map((post) => ({
        url: `${baseUrl}/guides/${post.slug}`,
        lastmod: new Date(post.updatedAt || post.publishedAt).toISOString(),
        changefreq: "weekly",
        priority: "0.7",
      }))
    );

    // 3. Dynamic Categories & Approved Workers from DB
    try {
      // 3.1 Active Categories
      const categories = await prisma.category.findMany({
        where: { is_active: true },
        select: { slug: true, updated_at: true },
      });

      entries.push(
        ...categories.map((cat) => ({
          url: `${baseUrl}/categories/${cat.slug}`,
          lastmod: cat.updated_at ? new Date(cat.updated_at).toISOString() : LAST_MODIFIED,
          changefreq: "weekly",
          priority: "0.8",
        }))
      );

      // 3.2 Approved Worker Profiles
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
    // ========================================================================
    // SECTION 2: DISTRICT-SPECIFIC SITEMAP (e.g. "dhaka-42", "chittagong-18")
    // District page + City Areas / Thanas + Upazilas
    // ========================================================================
    const districtSlug = rawId.replace(/-\d+$/, "");

    try {
      const districts = await prisma.district.findMany({
        include: {
          upazilas: true,
          city_areas: {
            where: { row_status: 1 },
          },
        },
      });

      const matchingDistrict = districts.find(
        (d) => toSlug(d.title_en || d.title_bn) === districtSlug
      );

      if (matchingDistrict) {
        const distSlug = toSlug(matchingDistrict.title_en || matchingDistrict.title_bn);
        const subSlugsSeen = new Set<string>();

        // 1. District URL: /locations/[district]
        entries.push({
          url: `${baseUrl}/locations/${distSlug}`,
          lastmod: LAST_MODIFIED,
          changefreq: "weekly",
          priority: "0.8",
        });

        // 2. City Area / Thana URLs: /locations/[district]/[city-area]
        if (matchingDistrict.city_areas && matchingDistrict.city_areas.length > 0) {
          for (const area of matchingDistrict.city_areas) {
            const areaSlug = toSlug(area.title_en || area.title_bn);
            if (areaSlug && !subSlugsSeen.has(areaSlug)) {
              subSlugsSeen.add(areaSlug);
              entries.push({
                url: `${baseUrl}/locations/${distSlug}/${areaSlug}`,
                lastmod: LAST_MODIFIED,
                changefreq: "weekly",
                priority: "0.7",
              });
            }
          }
        }

        // 3. Upazila URLs: /locations/[district]/[upazila]
        if (matchingDistrict.upazilas && matchingDistrict.upazilas.length > 0) {
          for (const upz of matchingDistrict.upazilas) {
            const upzSlug = toSlug(upz.title_en || upz.title_bn);
            if (upzSlug && !subSlugsSeen.has(upzSlug)) {
              subSlugsSeen.add(upzSlug);
              entries.push({
                url: `${baseUrl}/locations/${distSlug}/${upzSlug}`,
                lastmod: LAST_MODIFIED,
                changefreq: "weekly",
                priority: "0.7",
              });
            }
          }
        }

        // 4. Programmatic Category x Location URLs: /locations/[district]/[sub-area]/[category]
        // Strictly index ONLY combinations that have >= 1 verified approved worker (Zero Thin Content)
        const districtWorkers = await prisma.workerProfile.findMany({
          where: {
            status: "APPROVED",
            fk_district_id: matchingDistrict.id,
          },
          include: {
            workerCategories: {
              include: { category: true },
            },
            upazilaRef: true,
            cityAreaRef: true,
          },
        });

        const catLocSeen = new Set<string>();
        for (const worker of districtWorkers) {
          const areaSlug = toSlug(
            worker.cityAreaRef?.title_en ||
              worker.cityAreaRef?.title_bn ||
              worker.upazilaRef?.title_en ||
              worker.upazilaRef?.title_bn
          );

          if (areaSlug && subSlugsSeen.has(areaSlug)) {
            for (const wc of worker.workerCategories) {
              if (wc.category && wc.category.is_active && wc.category.slug) {
                const catLocUrl = `${baseUrl}/locations/${distSlug}/${areaSlug}/${wc.category.slug}`;
                if (!catLocSeen.has(catLocUrl)) {
                  catLocSeen.add(catLocUrl);
                  entries.push({
                    url: catLocUrl,
                    lastmod: new Date(worker.updated_at).toISOString(),
                    changefreq: "weekly",
                    priority: "0.8",
                  });
                }
              }
            }
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching district sitemap for ${rawId}:`, err);
    }
  }

  // ==========================================================================
  // SECTION 3: XML GENERATION & RESPONSE HEADERS
  // ==========================================================================
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
