import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function generateHexId(): string {
  return crypto.randomBytes(12).toString("hex");
}

// GET: Fetch locations, divisions, districts, upazilas, or unions
export async function GET(req: NextRequest) {
  const authenticated = await isAdminAuthenticated(req);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "service"; // 'service' | 'divisions' | 'districts' | 'upazilas' | 'unions'
    const query = searchParams.get("q")?.trim();
    const division = searchParams.get("division")?.trim();
    const status = searchParams.get("status"); // 'all' | 'active' | 'inactive'

    // 1. Divisions
    if (type === "divisions") {
      const divisions = await prisma.division.findMany({
        where: { row_status: 1 },
        orderBy: { title_en: "asc" },
        select: {
          id: true,
          title: true,
          title_en: true,
          title_bn: true,
          bbs_code: true,
          _count: {
            select: { districts: true },
          },
        },
      });
      return NextResponse.json({ divisions });
    }

    // 2. Districts
    if (type === "districts") {
      const where: any = {};
      if (query) {
        where.OR = [
          { title_en: { contains: query, mode: "insensitive" } },
          { title_bn: { contains: query } },
          { title: { contains: query, mode: "insensitive" } },
        ];
      }
      if (division && division !== "all") {
        where.OR = [
          { loc_division_id: division },
          { division: { title_en: { equals: division, mode: "insensitive" } } },
        ];
      }

      const districts = await prisma.district.findMany({
        where,
        orderBy: { title_en: "asc" },
        include: {
          division: { select: { id: true, title_en: true, title_bn: true } },
          _count: { select: { upazilas: true, workers: true } },
        },
      });

      return NextResponse.json({ districts });
    }

    // 3. Upazilas
    if (type === "upazilas") {
      const districtId = searchParams.get("district_id");
      const where: any = {};
      if (districtId) {
        where.loc_district_id = districtId;
      }
      if (query) {
        where.OR = [
          { title_en: { contains: query, mode: "insensitive" } },
          { title_bn: { contains: query } },
        ];
      }

      const upazilas = await prisma.upazila.findMany({
        where,
        orderBy: { title_en: "asc" },
        include: {
          district: { select: { id: true, title_en: true, title_bn: true } },
          _count: { select: { unions: true, workers: true } },
        },
        take: 300,
      });

      return NextResponse.json({ upazilas });
    }

    // 4. Unions
    if (type === "unions") {
      const upazilaId = searchParams.get("upazila_id");
      const districtId = searchParams.get("district_id");
      const where: any = {};
      if (upazilaId) {
        where.loc_upazila_id = upazilaId;
      }
      if (districtId) {
        where.loc_district_id = districtId;
      }
      if (query) {
        where.OR = [
          { title_en: { contains: query, mode: "insensitive" } },
          { title_bn: { contains: query } },
        ];
      }

      const unions = await prisma.union.findMany({
        where,
        orderBy: { title_en: "asc" },
        include: {
          upazila: {
            select: {
              id: true,
              title_en: true,
              title_bn: true,
              district: {
                select: { id: true, title_en: true, title_bn: true },
              },
            },
          },
          _count: { select: { workers: true } },
        },
        take: 200,
      });

    }

    // 5. City Areas
    if (type === "city_areas") {
      const districtId = searchParams.get("district_id")?.trim();
      const where: any = {};
      if (districtId && districtId !== "all") {
        where.loc_district_id = districtId;
      }
      if (division && division !== "all") {
        where.loc_division_id = division;
      }
      if (query) {
        where.OR = [
          { title_en: { contains: query, mode: "insensitive" } },
          { title_bn: { contains: query } },
          { parent_thana: { contains: query, mode: "insensitive" } },
        ];
      }

      const cityAreas = await prisma.cityArea.findMany({
        where,
        orderBy: [{ loc_district_id: "asc" }, { title_en: "asc" }],
        include: {
          district: {
            select: { id: true, title_en: true, title_bn: true },
          },
          upazila: {
            select: { id: true, title_en: true, title_bn: true },
          },
          _count: { select: { workers: true } },
        },
        take: 300,
      });

      return NextResponse.json({ city_areas: cityAreas });
    }

    return NextResponse.json({ locations: [] });
  } catch (error) {
    console.error("GET /api/sr-admin/locations error:", error);
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

// POST: Add new location / district / upazila / union
export async function POST(req: NextRequest) {
  const authenticated = await isAdminAuthenticated(req);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const type = body.type || "service";

    // 1. ADD DISTRICT
    if (type === "district") {
      const { id, title_en, title_bn, loc_division_id, url, bbs_code } = body;
      if (!title_en || !loc_division_id) {
        return NextResponse.json(
          { error: "District Title English and Division are required" },
          { status: 400 }
        );
      }
      const districtId = id?.trim() || generateHexId();
      const district = await prisma.district.upsert({
        where: { id: districtId },
        update: {
          title: title_en.trim(),
          title_en: title_en.trim(),
          title_bn: title_bn?.trim() || null,
          loc_division_id,
          url: url?.trim() || null,
          bbs_code: bbs_code ? parseInt(bbs_code, 10) : null,
          row_status: 1,
        },
        create: {
          id: districtId,
          title: title_en.trim(),
          title_en: title_en.trim(),
          title_bn: title_bn?.trim() || null,
          loc_division_id,
          url: url?.trim() || null,
          bbs_code: bbs_code ? parseInt(bbs_code, 10) : null,
          row_status: 1,
        },
      });
      return NextResponse.json({ success: true, district });
    }

    // 2. ADD UPAZILA
    if (type === "upazila") {
      const { id, title_en, title_bn, loc_district_id, loc_division_id, url, bbs_code } = body;
      if (!title_en || !loc_district_id) {
        return NextResponse.json(
          { error: "Upazila Title English and District are required" },
          { status: 400 }
        );
      }

      // Auto-resolve division from parent district if not supplied
      let divId = loc_division_id;
      if (!divId) {
        const dist = await prisma.district.findUnique({
          where: { id: loc_district_id },
        });
        divId = dist?.loc_division_id || "1";
      }

      const upazilaId = id?.trim() || generateHexId();
      const upazila = await prisma.upazila.upsert({
        where: { id: upazilaId },
        update: {
          title_en: title_en.trim(),
          title_bn: title_bn?.trim() || null,
          loc_district_id,
          loc_division_id: divId,
          url: url?.trim() || null,
          bbs_code: bbs_code ? String(bbs_code) : null,
          row_status: 1,
        },
        create: {
          id: upazilaId,
          title_en: title_en.trim(),
          title_bn: title_bn?.trim() || null,
          loc_district_id,
          loc_division_id: divId,
          url: url?.trim() || null,
          bbs_code: bbs_code ? String(bbs_code) : null,
          row_status: 1,
        },
      });
      return NextResponse.json({ success: true, upazila });
    }

    // 3. ADD UNION
    if (type === "union") {
      const { id, title_en, title_bn, loc_upazila_id, loc_district_id, loc_division_id, bbs_code } = body;
      if (!title_en || !loc_upazila_id) {
        return NextResponse.json(
          { error: "Union Title English and Upazila are required" },
          { status: 400 }
        );
      }

      // Auto-resolve parent district & division from upazila if not supplied
      let distId = loc_district_id;
      let divId = loc_division_id;
      if (!distId || !divId) {
        const upz = await prisma.upazila.findUnique({
          where: { id: loc_upazila_id },
        });
        distId = distId || upz?.loc_district_id || "1";
        divId = divId || upz?.loc_division_id || "1";
      }

      const unionId = id?.trim() || generateHexId();
      const unionRecord = await prisma.union.upsert({
        where: { id: unionId },
        update: {
          title_en: title_en.trim(),
          title_bn: title_bn?.trim() || null,
          loc_upazila_id,
          loc_district_id: distId,
          loc_division_id: divId,
          bbs_code: bbs_code ? String(bbs_code) : null,
          row_status: 1,
        },
        create: {
          id: unionId,
          title_en: title_en.trim(),
          title_bn: title_bn?.trim() || null,
          loc_upazila_id,
          loc_district_id: distId,
          loc_division_id: divId,
          bbs_code: bbs_code ? String(bbs_code) : null,
          row_status: 1,
        },
      });
      return NextResponse.json({ success: true, union: unionRecord });
    }

    // 4. ADD CITY AREA
    if (type === "city_area") {
      const { title_bn, title_en, loc_district_id, loc_division_id, loc_upazila_id, parent_thana, postal_code, bbs_code } = body;
      if (!title_bn || !title_en || !loc_district_id) {
        return NextResponse.json(
          { error: "Title (Bangla and English) and parent district are required" },
          { status: 400 }
        );
      }

      let divId = loc_division_id;
      if (!divId) {
        const dist = await prisma.district.findUnique({
          where: { id: loc_district_id },
          select: { loc_division_id: true },
        });
        divId = dist?.loc_division_id;
      }

      if (!divId) {
        return NextResponse.json({ error: "Could not resolve parent division" }, { status: 400 });
      }

      const cityArea = await prisma.cityArea.create({
        data: {
          title_bn: title_bn.trim(),
          title_en: title_en.trim(),
          loc_district_id,
          loc_division_id: divId,
          loc_upazila_id: loc_upazila_id || null,
          parent_thana: parent_thana?.trim() || null,
          postal_code: postal_code?.trim() || null,
          bbs_code: bbs_code ? String(bbs_code).trim() : null,
          row_status: 1,
        },
      });

      return NextResponse.json({ success: true, cityArea });
    }

    // 5. ADD SERVICE LOCATION
    const { name, name_bn, division, description, is_active } = body;
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Location name is required" },
        { status: 400 }
      );
    }

    const rawSlug = body.slug ? slugify(body.slug) : slugify(name);
    return NextResponse.json(
      { error: "Legacy location table has been removed. Please manage Districts, Upazilas, City Areas, or Unions." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("POST /api/sr-admin/locations error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create location" },
      { status: 500 }
    );
  }
}

// PUT: Update location / district / upazila / union
export async function PUT(req: NextRequest) {
  const authenticated = await isAdminAuthenticated(req);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const type = body.type || "service";

    // 1. UPDATE DISTRICT
    if (type === "district") {
      const { id, title_en, title_bn, loc_division_id, url, bbs_code, row_status } = body;
      if (!id) {
        return NextResponse.json({ error: "District ID is required" }, { status: 400 });
      }

      const updatedDistrict = await prisma.district.update({
        where: { id },
        data: {
          title: title_en ? title_en.trim() : undefined,
          title_en: title_en ? title_en.trim() : undefined,
          title_bn: title_bn !== undefined ? (title_bn?.trim() || null) : undefined,
          loc_division_id: loc_division_id || undefined,
          url: url !== undefined ? (url?.trim() || null) : undefined,
          bbs_code: bbs_code ? parseInt(bbs_code, 10) : undefined,
          row_status: row_status !== undefined ? Number(row_status) : undefined,
        },
      });

      return NextResponse.json({ success: true, district: updatedDistrict });
    }

    // 2. UPDATE UPAZILA
    if (type === "upazila") {
      const { id, title_en, title_bn, loc_district_id, url, bbs_code, row_status } = body;
      if (!id) {
        return NextResponse.json({ error: "Upazila ID is required" }, { status: 400 });
      }

      const updatedUpazila = await prisma.upazila.update({
        where: { id },
        data: {
          title_en: title_en ? title_en.trim() : undefined,
          title_bn: title_bn !== undefined ? (title_bn?.trim() || null) : undefined,
          loc_district_id: loc_district_id || undefined,
          url: url !== undefined ? (url?.trim() || null) : undefined,
          bbs_code: bbs_code !== undefined ? (bbs_code ? String(bbs_code) : null) : undefined,
          row_status: row_status !== undefined ? Number(row_status) : undefined,
        },
      });

      return NextResponse.json({ success: true, upazila: updatedUpazila });
    }

    // 3. UPDATE UNION
    if (type === "union") {
      const { id, title_en, title_bn, loc_upazila_id, bbs_code, row_status } = body;
      if (!id) {
        return NextResponse.json({ error: "Union ID is required" }, { status: 400 });
      }

      const updatedUnion = await prisma.union.update({
        where: { id },
        data: {
          title_en: title_en ? title_en.trim() : undefined,
          title_bn: title_bn !== undefined ? (title_bn?.trim() || null) : undefined,
          loc_upazila_id: loc_upazila_id || undefined,
          bbs_code: bbs_code !== undefined ? (bbs_code ? String(bbs_code) : null) : undefined,
          row_status: row_status !== undefined ? Number(row_status) : undefined,
        },
      });

      return NextResponse.json({ success: true, union: updatedUnion });
    }

    // 4. UPDATE CITY AREA
    if (type === "city_area") {
      const { id, title_en, title_bn, parent_thana, postal_code, bbs_code, loc_upazila_id, row_status } = body;
      if (!id) {
        return NextResponse.json({ error: "City Area ID is required" }, { status: 400 });
      }

      const updatedCityArea = await prisma.cityArea.update({
        where: { id },
        data: {
          title_en: title_en ? title_en.trim() : undefined,
          title_bn: title_bn !== undefined ? (title_bn?.trim() || null) : undefined,
          parent_thana: parent_thana !== undefined ? (parent_thana?.trim() || null) : undefined,
          postal_code: postal_code !== undefined ? (postal_code?.trim() || null) : undefined,
          bbs_code: bbs_code !== undefined ? (bbs_code ? String(bbs_code).trim() : null) : undefined,
          loc_upazila_id: loc_upazila_id !== undefined ? (loc_upazila_id || null) : undefined,
          row_status: row_status !== undefined ? Number(row_status) : undefined,
        },
      });

      return NextResponse.json({ success: true, cityArea: updatedCityArea });
    }

    // 4. UPDATE SERVICE LOCATION
    const { id, name, name_bn, slug, division, description, is_active } = body;
    return NextResponse.json(
      { error: "Legacy location table has been removed. Please manage Districts, Upazilas, City Areas, or Unions." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("PUT /api/sr-admin/locations error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update location" },
      { status: 500 }
    );
  }
}

// DELETE: Deactivate or delete location, district, upazila, or union
export async function DELETE(req: NextRequest) {
  const authenticated = await isAdminAuthenticated(req);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type") || "service";
    const hardDelete = searchParams.get("hard") === "true";

    if (!id) {
      return NextResponse.json(
        { error: "Entity ID is required" },
        { status: 400 }
      );
    }

    // 1. DELETE CITY AREA
    if (type === "city_area") {
      const workerCount = await prisma.workerProfile.count({
        where: { fk_city_area_id: id },
      });
      if (workerCount > 0 && hardDelete) {
        return NextResponse.json(
          { error: `Cannot delete city area because ${workerCount} worker(s) are associated with it.` },
          { status: 400 }
        );
      }
      if (hardDelete) {
        await prisma.cityArea.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "City Area deleted permanently" });
      }
      const updated = await prisma.cityArea.update({
        where: { id },
        data: { row_status: 0 },
      });
      return NextResponse.json({ success: true, message: "City Area deactivated", cityArea: updated });
    }

    // 2. DELETE UNION
    if (type === "union") {
      const workerCount = await prisma.workerProfile.count({
        where: { fk_union_id: id },
      });
      if (workerCount > 0 && hardDelete) {
        return NextResponse.json(
          { error: `Cannot delete union because ${workerCount} worker(s) are associated with it.` },
          { status: 400 }
        );
      }
      if (hardDelete) {
        await prisma.union.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Union deleted permanently" });
      }
      const updated = await prisma.union.update({
        where: { id },
        data: { row_status: 0 },
      });
      return NextResponse.json({ success: true, message: "Union deactivated", union: updated });
    }

    // 2. DELETE UPAZILA
    if (type === "upazila") {
      const unionCount = await prisma.union.count({ where: { loc_upazila_id: id } });
      if (unionCount > 0 && hardDelete) {
        return NextResponse.json(
          { error: `Cannot delete upazila because ${unionCount} union(s) are attached. Remove unions first.` },
          { status: 400 }
        );
      }
      if (hardDelete) {
        await prisma.upazila.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "Upazila deleted permanently" });
      }
      const updated = await prisma.upazila.update({
        where: { id },
        data: { row_status: 0 },
      });
      return NextResponse.json({ success: true, message: "Upazila deactivated", upazila: updated });
    }

    // 3. DELETE DISTRICT
    if (type === "district") {
      const upazilaCount = await prisma.upazila.count({ where: { loc_district_id: id } });
      if (upazilaCount > 0 && hardDelete) {
        return NextResponse.json(
          { error: `Cannot delete district because ${upazilaCount} upazila(s) are attached. Remove upazilas first.` },
          { status: 400 }
        );
      }
      if (hardDelete) {
        await prisma.district.delete({ where: { id } });
        return NextResponse.json({ success: true, message: "District deleted permanently" });
      }
      const updated = await prisma.district.update({
        where: { id },
        data: { row_status: 0 },
      });
      return NextResponse.json({ success: true, message: "District deactivated", district: updated });
    }

    return NextResponse.json(
      { error: "Legacy location table has been removed. Please manage Districts, Upazilas, City Areas, or Unions." },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("DELETE /api/sr-admin/locations error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process location delete/deactivation" },
      { status: 500 }
    );
  }
}
