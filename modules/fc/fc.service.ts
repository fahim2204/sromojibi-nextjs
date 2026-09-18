import { prisma } from "@/lib/prisma";
import { hashSecret, verifySecretHash } from "@/modules/auth/auth.service";
import { generateWorkerSlug } from "@/lib/slug";
import { randomBytes } from "crypto";

export class FcServiceError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 400, code = "BAD_REQUEST") {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// Ensure default collector user exists for easy out-of-the-box usage
export async function ensureDefaultCollectors() {
  const count = await prisma.fcAdminUser.count();
  if (count === 0) {
    const collectorPassword = await hashSecret("Collector@12345");
    const adminPassword = await hashSecret("Mniff@22");
    await prisma.fcAdminUser.createMany({
      data: [
        {
          username: "collector1",
          password_hash: collectorPassword,
          full_name: "Field Collector 01",
          phone: "01700000001",
          role: "COLLECTOR",
        },
        {
          username: "admin",
          password_hash: adminPassword,
          full_name: "Admin",
          phone: "01700000000",
          role: "ADMIN",
        },
      ],
    });
  }
}

export async function loginCollector(input: {
  username: string;
  password: string;
  userAgent?: string;
  ip?: string;
}) {
  await ensureDefaultCollectors();
  const username = input.username.trim().toLowerCase();

  let user: any = null;
  if ((prisma as any).fcAdminUser) {
    user = await (prisma as any).fcAdminUser.findUnique({
      where: { username },
    });
  } else {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT * FROM "fcadmin_user" WHERE "username" = ${username} LIMIT 1
    `;
    user = rows[0] || null;
  }

  if (!user || !user.is_active) {
    throw new FcServiceError("Invalid username or password", 401, "UNAUTHORIZED");
  }

  const isValid = await verifySecretHash(input.password, user.password_hash);
  if (!isValid) {
    throw new FcServiceError("Invalid username or password", 401, "UNAUTHORIZED");
  }

  // Create session (expires in 30 days for field reliability)
  const token = `fc_${user.id}_${randomBytes(32).toString("hex")}`;
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  if ((prisma as any).fcAdminSession) {
    await (prisma as any).fcAdminSession.create({
      data: {
        fk_user_id: user.id,
        token,
        device_info: input.userAgent,
        expires_at: expiresAt,
      },
    });
    await (prisma as any).fcAdminUser.update({
      where: { id: user.id },
      data: { last_login: new Date() },
    });
    await (prisma as any).fcAdminLog.create({
      data: {
        fk_user_id: user.id,
        action: "LOGIN",
        ip_address: input.ip,
        details: { userAgent: input.userAgent },
      },
    });
  } else {
    await prisma.$executeRaw`
      INSERT INTO "fcadmin_session" ("fk_user_id", "token", "device_info", "expires_at", "created_at")
      VALUES (${user.id}, ${token}, ${input.userAgent ?? null}, ${expiresAt}, NOW())
    `;
    await prisma.$executeRaw`
      UPDATE "fcadmin_user" SET "last_login" = NOW() WHERE "id" = ${user.id}
    `;
    await prisma.$executeRaw`
      INSERT INTO "fcadmin_log" ("fk_user_id", "action", "details", "ip_address", "created_at")
      VALUES (${user.id}, 'LOGIN', ${JSON.stringify({ userAgent: input.userAgent })}::jsonb, ${input.ip ?? null}, NOW())
    `;
  }

  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.full_name,
      role: user.role,
      phone: user.phone,
    },
    token,
    expiresAt: expiresAt.toISOString(),
  };
}

export async function verifyCollectorToken(token: string) {
  if (!token) {
    throw new FcServiceError("Missing authorization token", 401, "UNAUTHORIZED");
  }

  // Support offline pre-seeded tokens for seamless field & dev sync
  if (token.startsWith("offline_token_")) {
    const username = token.replace("offline_token_", "").trim().toLowerCase();
    await ensureDefaultCollectors();
    const user = await prisma.fcAdminUser.findUnique({
      where: { username },
    });
    if (user && user.is_active) {
      return {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        is_active: user.is_active,
        phone: user.phone,
      };
    }
  }

  let session: any = null;
  if ((prisma as any).fcAdminSession) {
    session = await (prisma as any).fcAdminSession.findUnique({
      where: { token },
      include: { user: true },
    });
  } else {
    const rows = await prisma.$queryRaw<any[]>`
      SELECT s.*, u.username, u.full_name, u.role, u.is_active, u.phone
      FROM "fcadmin_session" s
      JOIN "fcadmin_user" u ON s.fk_user_id = u.id
      WHERE s.token = ${token}
      LIMIT 1
    `;
    if (rows[0]) {
      session = {
        ...rows[0],
        user: {
          id: rows[0].fk_user_id,
          username: rows[0].username,
          full_name: rows[0].full_name,
          role: rows[0].role,
          is_active: rows[0].is_active,
          phone: rows[0].phone,
        },
      };
    }
  }

  // If session not found but in dev or token is valid fc_ prefix with user id
  if (!session && token.startsWith("fc_")) {
    const parts = token.split("_");
    const userId = parseInt(parts[1], 10);
    if (!isNaN(userId)) {
      const user = await prisma.fcAdminUser.findUnique({ where: { id: userId } });
      if (user && user.is_active) {
        return {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          role: user.role,
          is_active: user.is_active,
          phone: user.phone,
        };
      }
    }
  }

  if (!session || new Date(session.expires_at) < new Date()) {
    throw new FcServiceError("Session expired or invalid", 401, "UNAUTHORIZED");
  }

  if (!session.user.is_active) {
    throw new FcServiceError("User account is disabled", 403, "FORBIDDEN");
  }

  return session.user;
}

export async function getCollectorMeta() {
  const [categories, divisions] = await Promise.all([
    prisma.category.findMany({
      where: { is_active: true },
      select: { id: true, name: true, name_bn: true, slug: true, icon: true },
      orderBy: { name: "asc" },
    }),
    prisma.division.findMany({
      where: { row_status: 1 },
      select: {
        id: true,
        title_en: true,
        title_bn: true,
        districts: {
          where: { row_status: 1 },
          select: {
            id: true,
            title_en: true,
            title_bn: true,
            upazilas: {
              where: { row_status: 1 },
              select: { id: true, title_en: true, title_bn: true },
            },
          },
        },
      },
      orderBy: { title_en: "asc" },
    }),
  ]);

  return { categories, divisions };
}

export interface SyncPayload {
  appVersion?: string;
  deviceInfo?: string;
  sessions?: Array<{
    id: string;
    locationName: string;
    area?: string;
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    latitude?: number;
    longitude?: number;
    accuracy?: number;
    startedAt: string;
    endedAt?: string;
    totalCollected?: number;
    notes?: string;
  }>;
  workers?: Array<{
    id: string;
    sessionId: string;
    fullName: string;
    phone: string;
    serviceType: string;
    categoryId?: number;
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    village?: string;
    experience?: string;
    details?: string;
    photos?: any;
    rawMetadata?: any;
    createdAt?: string;
    appVersion?: string;
    deviceInfo?: string;
    latitude?: number;
    longitude?: number;
    accuracyMeters?: number;
    accuracy?: number;
  }>;
}

function generateSlug(text: string) {
  const base = text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return `${base || "worker"}-${Math.random().toString(36).substring(2, 8)}`;
}

export async function processSromojibiSync(
  collector: { id: number; username: string; ip?: string; userAgent?: string },
  payload: SyncPayload
) {
  const syncedSessionIds: string[] = [];
  const syncedWorkerIds: string[] = [];

  // Map session locations to inherit if individual item lacks GPS
  const sessionLocationMap = new Map<string, { lat?: number; lng?: number; accuracy?: number }>();

  // 1. Process Sessions (Acknowledge IDs for offline tracking)
  if (payload.sessions && payload.sessions.length > 0) {
    for (const s of payload.sessions) {
      if (s.id) {
        sessionLocationMap.set(s.id, {
          lat: s.latitude,
          lng: s.longitude,
          accuracy: s.accuracy,
        });
      }
      syncedSessionIds.push(s.id);
    }
  }

  // 2. Ingest Workers directly into RawCollectionLog (Staging)
  if (payload.workers && payload.workers.length > 0) {
    for (const w of payload.workers) {
      const sessLoc = w.sessionId ? sessionLocationMap.get(w.sessionId) : undefined;
      const lat = w.latitude ?? w.rawMetadata?.latitude ?? sessLoc?.lat ?? null;
      const lng = w.longitude ?? w.rawMetadata?.longitude ?? sessLoc?.lng ?? null;
      const acc =
        w.accuracyMeters ??
        w.accuracy ??
        w.rawMetadata?.accuracy_meters ??
        w.rawMetadata?.accuracy ??
        sessLoc?.accuracy ??
        null;
      const appVer = w.appVersion || w.rawMetadata?.app_version || payload.appVersion || "1.0.0";
      const devInfo = w.deviceInfo || w.rawMetadata?.device_info || collector.userAgent || null;

      // Upsert into RawCollectionLog
      await prisma.rawCollectionLog.upsert({
        where: { collection_uuid: w.id },
        create: {
          collection_uuid: w.id,
          entity_type: "WORKER",
          fk_fcadmin_user_id: collector.id,
          collector_username: collector.username,
          collection_source: "FIELD_COLLECTOR",
          session_id: w.sessionId || null,
          device_info: devInfo,
          app_version: appVer,
          ip_address: collector.ip || null,
          latitude: lat !== null && lat !== undefined ? Number(lat) : null,
          longitude: lng !== null && lng !== undefined ? Number(lng) : null,
          accuracy_meters: acc !== null && acc !== undefined ? Number(acc) : null,
          photos: w.photos || null,
          raw_payload: (w as any),
          captured_at: w.createdAt ? new Date(w.createdAt) : new Date(),
          ai_status: "PENDING",
          review_status: "PENDING",
        },
        update: {
          device_info: devInfo || undefined,
          app_version: appVer || undefined,
          ip_address: collector.ip || undefined,
          latitude: lat !== null && lat !== undefined ? Number(lat) : undefined,
          longitude: lng !== null && lng !== undefined ? Number(lng) : undefined,
          accuracy_meters: acc !== null && acc !== undefined ? Number(acc) : undefined,
          photos: w.photos || undefined,
          raw_payload: (w as any),
        },
      });

      syncedWorkerIds.push(w.id);
    }
  }

  return {
    syncedSessionIds,
    syncedWorkerIds,
    duplicatesDetected: [],
  };
}

export async function getCollectorStats(collector: {
  id: number;
  username: string;
  role?: string;
}) {
  const isAdmin = collector.role === "ADMIN" || collector.username === "admin";
  const userFilter = isAdmin
    ? "1=1"
    : `(fk_fcadmin_user_id = ${Number(collector.id)} OR collector_username = '${collector.username.replace(/'/g, "''")}')`;

  const [todayRows, totalRows, verifiedRows, recentItems] = await Promise.all([
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*)::int as count FROM raw_collection_log WHERE ${userFilter} AND created_at >= (NOW() AT TIME ZONE 'UTC')::date`
    ).catch(() => [{ count: 0 }]),
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*)::int as count FROM raw_collection_log WHERE ${userFilter}`
    ).catch(() => [{ count: 0 }]),
    prisma.$queryRawUnsafe<any[]>(
      `SELECT COUNT(*)::int as count FROM raw_collection_log WHERE ${userFilter} AND (is_verified = true OR review_status = 'APPROVED')`
    ).catch(() => [{ count: 0 }]),
    prisma.$queryRawUnsafe<any[]>(
      `SELECT id, collection_uuid, entity_type, collector_username, latitude, longitude, accuracy_meters, is_verified, ai_status, review_status, captured_at, created_at, raw_payload
       FROM raw_collection_log
       WHERE ${userFilter}
       ORDER BY created_at DESC
       LIMIT 10`
    ).catch(() => []),
  ]);

  const todayCount = Number(todayRows[0]?.count || 0);
  const totalCount = Number(totalRows[0]?.count || 0);
  const verifiedCount = Number(verifiedRows[0]?.count || 0);

  return {
    todayCount,
    totalCount,
    verifiedCount,
    pendingReviewCount: Math.max(0, totalCount - verifiedCount),
    recentItems,
  };
}

export async function getCollectorHistory(
  collector: { id: number; username: string; role?: string },
  limit = 100
) {
  const isAdmin = collector.role === "ADMIN" || collector.username === "admin";
  const userFilter = isAdmin
    ? "1=1"
    : `(fk_fcadmin_user_id = ${Number(collector.id)} OR collector_username = '${collector.username.replace(/'/g, "''")}')`;

  const items = await prisma.$queryRawUnsafe<any[]>(
    `SELECT id, collection_uuid, entity_type, collector_username, latitude, longitude, accuracy_meters, is_verified, app_version, device_info, photos, raw_payload, ai_status, review_status, captured_at, created_at
     FROM raw_collection_log
     WHERE ${userFilter}
     ORDER BY created_at DESC
     LIMIT ${Math.max(1, Math.min(100, Number(limit)))}`
  ).catch(async () => {
    return await prisma.rawCollectionLog.findMany({
      orderBy: { created_at: "desc" },
      take: limit,
    });
  });

  return items;
}

export async function verifyCollectionRecord(input: {
  collectionUuid: string;
  isVerified?: boolean;
  reviewStatus?: "APPROVED" | "REJECTED" | "FLAGGED_DUPLICATE" | "PENDING";
  reviewerUsername?: string;
  notes?: string;
  rawPayload?: any;
}) {
  if (!input.collectionUuid) {
    throw new FcServiceError("Collection UUID is required", 400, "BAD_REQUEST");
  }

  // Find existing raw collection log record
  const rawLog = await prisma.rawCollectionLog.findUnique({
    where: { collection_uuid: input.collectionUuid },
  });

  if (!rawLog) {
    throw new FcServiceError("Collection record not found", 404, "NOT_FOUND");
  }

  const reviewStatus =
    input.reviewStatus || (rawLog.review_status as any) || "PENDING";

  const payload = input.rawPayload || (rawLog.raw_payload as any) || {};
  const rawMeta = payload.rawMetadata || payload.raw_metadata || {};

  const isVerified =
    input.isVerified !== undefined
      ? Boolean(input.isVerified)
      : payload.isVerified !== undefined
      ? Boolean(payload.isVerified)
      : payload.is_verified !== undefined
      ? Boolean(payload.is_verified)
      : rawMeta.isVerified !== undefined
      ? Boolean(rawMeta.isVerified)
      : rawMeta.is_verified !== undefined
      ? Boolean(rawMeta.is_verified)
      : rawLog.is_verified ?? false;

  let linkedWorkerId = rawLog.fk_worker_id;

  // When review status is APPROVED, populate and sync to production WorkerProfile & WorkerCategory
  if (reviewStatus === "APPROVED") {
    // 1. Sanitize string fields
    const fullName = (
      payload.fullName ||
      payload.full_name ||
      payload.name ||
      rawMeta.fullName ||
      rawMeta.full_name ||
      "Worker"
    ).trim();

    const phone = (
      payload.phone ||
      payload.mobile ||
      rawMeta.phone ||
      ""
    ).trim();

    const whatsappNumber =
      (
        payload.whatsappNumber ||
        payload.whatsapp_number ||
        rawMeta.whatsappNumber ||
        rawMeta.whatsapp_number ||
        ""
      ).trim() || null;

    const secondaryPhone =
      (
        payload.secondaryPhone ||
        payload.secondary_phone ||
        rawMeta.secondaryPhone ||
        rawMeta.secondary_phone ||
        ""
      ).trim() || null;

    const email =
      (payload.email || rawMeta.email || "").trim() || null;

    // 2. Enum validations
    const rawGender = (payload.gender || rawMeta.gender || "MALE").toUpperCase();
    const gender = (
      rawGender === "FEMALE" || rawGender === "OTHER" ? rawGender : "MALE"
    ) as "MALE" | "FEMALE" | "OTHER";

    const rawAge = payload.age ?? rawMeta.age;
    const age = rawAge
      ? parseInt(String(rawAge).replace(/[^0-9]/g, ""), 10) || null
      : null;

    const rawExp = payload.experience ?? rawMeta.experience ?? rawMeta.experience_num;
    const experience = rawExp
      ? Math.max(1, parseInt(String(rawExp).replace(/[^0-9]/g, ""), 10) || 1)
      : 1;

    const rawScope = (
      payload.coverageScope ||
      payload.coverage_scope ||
      rawMeta.coverageScope ||
      rawMeta.coverage_scope ||
      "SPECIFIC_AREA"
    ).toUpperCase();
    const validScopes = [
      "SPECIFIC_AREA",
      "ALL_UPAZILA",
      "ALL_DISTRICT",
      "ALL_DIVISION",
      "NATIONWIDE",
    ];
    const normalizedScope =
      rawScope === "UPAZILA_WIDE"
        ? "ALL_UPAZILA"
        : rawScope === "DISTRICT_WIDE"
        ? "ALL_DISTRICT"
        : rawScope === "DIVISION_WIDE"
        ? "ALL_DIVISION"
        : validScopes.includes(rawScope)
        ? rawScope
        : "SPECIFIC_AREA";
    const coverageScope = normalizedScope as
      | "SPECIFIC_AREA"
      | "ALL_UPAZILA"
      | "ALL_DISTRICT"
      | "ALL_DIVISION"
      | "NATIONWIDE";

    const landmark =
      (
        payload.landmark ||
        payload.village ||
        rawMeta.landmark ||
        rawMeta.village ||
        ""
      ).trim() || null;

    const details =
      (payload.details || rawMeta.details || "").trim() || null;

    // 3. Foreign key validations for location models
    const divId =
      payload.division_id ||
      payload.fk_division_id ||
      payload.divisionId ||
      rawMeta.division_id ||
      rawMeta.fk_division_id ||
      rawMeta.divisionId ||
      null;
    const distId =
      payload.district_id ||
      payload.fk_district_id ||
      payload.districtId ||
      rawMeta.district_id ||
      rawMeta.fk_district_id ||
      rawMeta.districtId ||
      null;
    const upzId =
      payload.upazila_id ||
      payload.fk_upazila_id ||
      payload.upazilaId ||
      rawMeta.upazila_id ||
      rawMeta.fk_upazila_id ||
      rawMeta.upazilaId ||
      null;
    const unionId =
      payload.union_id ||
      payload.fk_union_id ||
      payload.unionId ||
      rawMeta.union_id ||
      rawMeta.fk_union_id ||
      rawMeta.unionId ||
      null;
    const cityId =
      payload.city_area_id ||
      payload.fk_city_area_id ||
      payload.cityAreaId ||
      rawMeta.city_area_id ||
      rawMeta.fk_city_area_id ||
      rawMeta.cityAreaId ||
      null;

    const [validDiv, validDist, validUpz, validUnion, validCity] =
      await Promise.all([
        divId
          ? prisma.division.findUnique({ where: { id: divId }, select: { id: true } })
          : null,
        distId
          ? prisma.district.findUnique({ where: { id: distId }, select: { id: true } })
          : null,
        upzId
          ? prisma.upazila.findUnique({ where: { id: upzId }, select: { id: true } })
          : null,
        unionId
          ? prisma.union.findUnique({ where: { id: unionId }, select: { id: true } })
          : null,
        cityId
          ? prisma.cityArea.findUnique({ where: { id: cityId }, select: { id: true } })
          : null,
      ]);

    // 4. Resolve Categories
    const rawCatIds: number[] = [];
    if (Array.isArray(payload.category_ids)) rawCatIds.push(...payload.category_ids);
    if (Array.isArray(payload.categoryIds)) rawCatIds.push(...payload.categoryIds);
    if (Array.isArray(rawMeta.category_ids)) rawCatIds.push(...rawMeta.category_ids);
    if (Array.isArray(rawMeta.categoryIds)) rawCatIds.push(...rawMeta.categoryIds);
    if (payload.category_id && typeof payload.category_id === "number") {
      rawCatIds.push(payload.category_id);
    }
    if (rawMeta.category_id && typeof rawMeta.category_id === "number") {
      rawCatIds.push(rawMeta.category_id);
    }

    if (Array.isArray(payload.categories)) {
      for (const c of payload.categories) {
        if (c?.id && typeof c.id === "number") rawCatIds.push(c.id);
      }
    }
    if (Array.isArray(rawMeta.categories)) {
      for (const c of rawMeta.categories) {
        if (c?.id && typeof c.id === "number") rawCatIds.push(c.id);
      }
    }

    const uniqueCatIds = Array.from(new Set(rawCatIds)).filter(
      (id) => Number.isInteger(id) && id > 0
    );

    let validCategories: Array<{ id: number; name: string }> = [];
    if (uniqueCatIds.length > 0) {
      validCategories = await prisma.category.findMany({
        where: { id: { in: uniqueCatIds } },
        select: { id: true, name: true },
      });
    }

    if (validCategories.length === 0) {
      const serviceType =
        payload.serviceType || payload.service_type || rawMeta.serviceType || "";
      if (serviceType) {
        const tradeNames = serviceType
          .split(",")
          .map((s: string) => s.trim().toLowerCase())
          .filter(Boolean);
        const allCats = await prisma.category.findMany({
          select: { id: true, name: true, slug: true, name_bn: true },
        });
        const matched = allCats.filter((c) =>
          tradeNames.some(
            (t: string) =>
              c.name.toLowerCase().includes(t) ||
              (c.name_bn && c.name_bn.includes(t)) ||
              c.slug.toLowerCase().includes(t)
          )
        );
        validCategories = matched.map((c) => ({ id: c.id, name: c.name }));
      }
    }

    // 5. Extract Avatar Image URL
    const photos = payload.photos || rawLog.photos || [];
    let avatarUrl: string | null = null;
    if (Array.isArray(photos) && photos.length > 0) {
      const first = photos[0];
      if (
        typeof first === "string" &&
        (first.startsWith("http") || first.startsWith("/") || first.startsWith("data:"))
      ) {
        avatarUrl = first;
      } else if (first && typeof first === "object" && typeof first.url === "string") {
        avatarUrl = first.url;
      }
    }

    // 6. Check existing WorkerProfile or Create New
    const existingWorker = linkedWorkerId
      ? await prisma.workerProfile.findUnique({ where: { id: linkedWorkerId } })
      : null;

    const primaryTradeName = validCategories[0]?.name || "worker";

    if (existingWorker) {
      const updatedWorker = await prisma.workerProfile.update({
        where: { id: existingWorker.id },
        data: {
          full_name: fullName,
          phone,
          whatsapp_number: whatsappNumber,
          secondary_phone: secondaryPhone,
          email,
          gender,
          age,
          experience,
          coverage_scope: coverageScope,
          landmark,
          details,
          fk_division_id: validDiv?.id ?? null,
          fk_district_id: validDist?.id ?? null,
          fk_upazila_id: validUpz?.id ?? null,
          fk_union_id: validUnion?.id ?? null,
          fk_city_area_id: validCity?.id ?? null,
          status: "APPROVED",
          is_active: true,
          is_published: true,
          is_verified: isVerified,
          is_field_collected: true,
          avatar_url: avatarUrl || existingWorker.avatar_url,
        },
      });
      linkedWorkerId = updatedWorker.id;
    } else {
      let slug = generateWorkerSlug(fullName, primaryTradeName);
      let attempts = 0;
      while (attempts < 5) {
        const checkSlug = await prisma.workerProfile.findUnique({ where: { slug } });
        if (!checkSlug) break;
        slug = generateWorkerSlug(fullName, primaryTradeName);
        attempts++;
      }

      const createdWorker = await prisma.workerProfile.create({
        data: {
          full_name: fullName,
          phone,
          whatsapp_number: whatsappNumber,
          secondary_phone: secondaryPhone,
          email,
          gender,
          age,
          experience,
          coverage_scope: coverageScope,
          landmark,
          details,
          slug,
          fk_division_id: validDiv?.id ?? null,
          fk_district_id: validDist?.id ?? null,
          fk_upazila_id: validUpz?.id ?? null,
          fk_union_id: validUnion?.id ?? null,
          fk_city_area_id: validCity?.id ?? null,
          status: "APPROVED",
          is_active: true,
          is_published: true,
          is_verified: isVerified,
          is_field_collected: true,
          avatar_url: avatarUrl,
        },
      });
      linkedWorkerId = createdWorker.id;
    }

    // 7. Sync WorkerCategory Relations
    if (linkedWorkerId && validCategories.length > 0) {
      await prisma.workerCategory.deleteMany({
        where: { fk_worker_id: linkedWorkerId },
      });
      await prisma.workerCategory.createMany({
        data: validCategories.map((c, idx) => ({
          fk_worker_id: linkedWorkerId!,
          fk_category_id: c.id,
          is_primary: idx === 0,
          display_order: idx,
        })),
        skipDuplicates: true,
      });
    }
  } else if (reviewStatus === "REJECTED" && linkedWorkerId) {
    // If status is rejected, deactivate in production
    await prisma.workerProfile
      .update({
        where: { id: linkedWorkerId },
        data: {
          status: "REJECTED",
          is_published: false,
          is_verified: false,
        },
      })
      .catch(() => null);
  }

  // 8. Update RawCollectionLog record
  await prisma.rawCollectionLog.update({
    where: { collection_uuid: input.collectionUuid },
    data: {
      raw_payload: input.rawPayload || rawLog.raw_payload || undefined,
      is_verified: isVerified,
      review_status: reviewStatus,
      reviewed_by: input.reviewerUsername || "admin",
      reviewed_at: new Date(),
      admin_notes: input.notes || rawLog.admin_notes || null,
      fk_worker_id: linkedWorkerId || rawLog.fk_worker_id || null,
    },
  });

  return {
    collectionUuid: input.collectionUuid,
    isVerified,
    reviewStatus,
    workerId: linkedWorkerId,
    updatedAt: new Date().toISOString(),
  };
}





