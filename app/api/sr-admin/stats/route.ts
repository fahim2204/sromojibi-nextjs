import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/adminAuth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const authenticated = await isAdminAuthenticated(req);
  if (!authenticated) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [
      cityAreasCount,
      unionsCount,
      divisionsCount,
      districtsCount,
      upazilasCount,
      totalWorkers,
      approvedWorkers,
      pendingWorkers,
      categoriesCount,
    ] = await Promise.all([
      prisma.cityArea.count(),
      prisma.union.count(),
      prisma.division.count(),
      prisma.district.count(),
      prisma.upazila.count(),
      prisma.workerProfile.count(),
      prisma.workerProfile.count({ where: { status: "APPROVED" } }),
      prisma.workerProfile.count({ where: { status: "PENDING" } }),
      prisma.category.count(),
    ]);

    return NextResponse.json({
      hierarchy: {
        divisions: divisionsCount,
        districts: districtsCount,
        upazilas: upazilasCount,
        cityAreas: cityAreasCount,
        unions: unionsCount,
      },
      workers: {
        total: totalWorkers,
        approved: approvedWorkers,
        pending: pendingWorkers,
      },
      categories: categoriesCount,
    });
  } catch (error) {
    console.error("GET /api/sr-admin/stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
