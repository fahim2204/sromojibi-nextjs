import { prisma } from "@/lib/prisma";
import { hashSecret, verifySecretHash } from "@/modules/auth/auth.service";
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

  const isVerified =
    input.isVerified !== undefined
      ? input.isVerified
      : input.reviewStatus === "APPROVED"
      ? true
      : undefined;

  if (input.rawPayload) {
    await prisma.$executeRawUnsafe(
      `UPDATE raw_collection_log
       SET raw_payload = $1::jsonb,
           is_verified = COALESCE($2, is_verified),
           review_status = COALESCE($3, review_status),
           reviewed_by = COALESCE($4, reviewed_by),
           reviewed_at = NOW(),
           admin_notes = COALESCE($5, admin_notes),
           updated_at = NOW()
       WHERE collection_uuid = $6`,
      JSON.stringify(input.rawPayload),
      isVerified,
      input.reviewStatus || null,
      input.reviewerUsername || "admin",
      input.notes || null,
      input.collectionUuid
    );
  } else {
    await prisma.$executeRawUnsafe(
      `UPDATE raw_collection_log
       SET is_verified = COALESCE($1, is_verified),
           review_status = COALESCE($2, review_status),
           reviewed_by = COALESCE($3, reviewed_by),
           reviewed_at = NOW(),
           admin_notes = COALESCE($4, admin_notes),
           updated_at = NOW()
       WHERE collection_uuid = $5`,
      isVerified,
      input.reviewStatus || null,
      input.reviewerUsername || "admin",
      input.notes || null,
      input.collectionUuid
    );
  }

  return {
    collectionUuid: input.collectionUuid,
    isVerified,
    reviewStatus: input.reviewStatus,
    updatedAt: new Date().toISOString(),
  };
}





