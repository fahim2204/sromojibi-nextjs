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
    const defaultPassword = await hashSecret("Collector@12345");
    await prisma.fcAdminUser.createMany({
      data: [
        {
          username: "collector1",
          password_hash: defaultPassword,
          full_name: "Field Collector 01",
          phone: "01700000001",
          role: "COLLECTOR",
        },
        {
          username: "admin",
          password_hash: defaultPassword,
          full_name: "FC Admin",
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
  }>;
}

export async function processSromojibiSync(
  collector: { id: number; username: string },
  payload: SyncPayload
) {
  const syncedSessionIds: string[] = [];
  const syncedWorkerIds: string[] = [];
  const duplicatesDetected: Array<{ id: string; phone: string; reason: string }> = [];

  // 1. Process Sessions
  if (payload.sessions && payload.sessions.length > 0) {
    for (const s of payload.sessions) {
      if (typeof (prisma as any).fcCollectionSession?.upsert === "function") {
        await (prisma as any).fcCollectionSession.upsert({
          where: { id: s.id },
          create: {
            id: s.id,
            fk_collector_id: collector.id,
            collector_username: collector.username,
            location_name: s.locationName,
            area: s.area,
            division_id: s.divisionId,
            district_id: s.districtId,
            upazila_id: s.upazilaId,
            latitude: s.latitude !== undefined ? s.latitude : null,
            longitude: s.longitude !== undefined ? s.longitude : null,
            accuracy: s.accuracy !== undefined ? s.accuracy : null,
            started_at: new Date(s.startedAt),
            ended_at: s.endedAt ? new Date(s.endedAt) : null,
            total_collected: s.totalCollected || 0,
            notes: s.notes,
          },
          update: {
            location_name: s.locationName,
            area: s.area,
            ended_at: s.endedAt ? new Date(s.endedAt) : undefined,
            total_collected: s.totalCollected,
            notes: s.notes,
          },
        });
      } else {
        await prisma.$executeRaw`
          INSERT INTO "fc_collection_session" (
            "id", "fk_collector_id", "collector_username", "location_name", "area",
            "division_id", "district_id", "upazila_id", "latitude", "longitude", "accuracy",
            "started_at", "ended_at", "total_collected", "notes", "created_at", "updated_at"
          ) VALUES (
            ${s.id}, ${collector.id}, ${collector.username}, ${s.locationName}, ${s.area ?? null},
            ${s.divisionId ?? null}, ${s.districtId ?? null}, ${s.upazilaId ?? null},
            ${s.latitude ?? null}, ${s.longitude ?? null}, ${s.accuracy ?? null},
            ${new Date(s.startedAt)}, ${s.endedAt ? new Date(s.endedAt) : null},
            ${s.totalCollected ?? 0}, ${s.notes ?? null}, NOW(), NOW()
          )
          ON CONFLICT ("id") DO UPDATE SET
            "location_name" = EXCLUDED."location_name",
            "area" = EXCLUDED."area",
            "ended_at" = EXCLUDED."ended_at",
            "total_collected" = EXCLUDED."total_collected",
            "notes" = EXCLUDED."notes",
            "updated_at" = NOW()
        `;
      }
      syncedSessionIds.push(s.id);
    }
  }

  // 2. Process Workers
  if (payload.workers && payload.workers.length > 0) {
    for (const w of payload.workers) {
      // Check duplicate phone in production worker profile or previous collection
      const cleanPhone = w.phone.replace(/[^0-9]/g, "");
      let isDuplicate = false;
      let duplicateNotes: string | null = null;

      try {
        const existingProdWorker = await prisma.workerProfile.findFirst({
          where: { phone: { contains: cleanPhone.slice(-10) } },
          select: { id: true, full_name: true, phone: true },
        });

        if (existingProdWorker) {
          isDuplicate = true;
          duplicateNotes = `Matches live WorkerProfile #${existingProdWorker.id} (${existingProdWorker.full_name})`;
          duplicatesDetected.push({ id: w.id, phone: w.phone, reason: duplicateNotes });
        }
      } catch (_) {}

      if (typeof (prisma as any).fcCollectedWorker?.upsert === "function") {
        await (prisma as any).fcCollectedWorker.upsert({
          where: { id: w.id },
          create: {
            id: w.id,
            session_id: w.sessionId,
            full_name: w.fullName,
            phone: w.phone,
            service_type: w.serviceType,
            category_id: w.categoryId,
            division_id: w.divisionId,
            district_id: w.districtId,
            upazila_id: w.upazilaId,
            village: w.village,
            experience: w.experience,
            details: w.details,
            status: "DRAFT",
            is_duplicate: isDuplicate,
            duplicate_notes: duplicateNotes,
            photos: w.photos || null,
            raw_metadata: w.rawMetadata || null,
            created_at: w.createdAt ? new Date(w.createdAt) : new Date(),
          },
          update: {
            full_name: w.fullName,
            phone: w.phone,
            service_type: w.serviceType,
            category_id: w.categoryId,
            details: w.details,
            is_duplicate: isDuplicate,
            duplicate_notes: duplicateNotes,
          },
        });
      } else {
        await prisma.$executeRaw`
          INSERT INTO "fc_collected_worker" (
            "id", "session_id", "full_name", "phone", "service_type", "category_id",
            "division_id", "district_id", "upazila_id", "village", "experience", "details",
            "status", "is_duplicate", "duplicate_notes", "created_at", "updated_at"
          ) VALUES (
            ${w.id}, ${w.sessionId}, ${w.fullName}, ${w.phone}, ${w.serviceType}, ${w.categoryId ?? null},
            ${w.divisionId ?? null}, ${w.districtId ?? null}, ${w.upazilaId ?? null},
            ${w.village ?? null}, ${w.experience ?? null}, ${w.details ?? null},
            'DRAFT'::"FcRecordStatus", ${isDuplicate}, ${duplicateNotes},
            ${w.createdAt ? new Date(w.createdAt) : new Date()}, NOW()
          )
          ON CONFLICT ("id") DO UPDATE SET
            "full_name" = EXCLUDED."full_name",
            "phone" = EXCLUDED."phone",
            "service_type" = EXCLUDED."service_type",
            "is_duplicate" = EXCLUDED."is_duplicate",
            "duplicate_notes" = EXCLUDED."duplicate_notes",
            "updated_at" = NOW()
        `;
      }

      syncedWorkerIds.push(w.id);
    }
  }

  return {
    syncedSessionIds,
    syncedWorkerIds,
    duplicatesDetected,
  };
}
