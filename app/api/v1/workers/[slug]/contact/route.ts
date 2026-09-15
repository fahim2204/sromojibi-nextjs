import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/modules/auth";

export const runtime = "nodejs";

// Max reveals allowed per user in a 24-hour rolling window
const DAILY_REVEAL_LIMIT = 30;
// Debounce window to prevent duplicate logging if user taps multiple times
const DEDUP_WINDOW_MS = 5 * 60 * 1000;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const authHeader = req.headers.get("authorization");
    const user = await getSessionUser(authHeader);

    if (!user) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "UNAUTHORIZED",
            message: "মিস্ত্রির ফোন নম্বর দেখতে অনুগ্রহ করে প্রথমে লগইন করুন।",
          },
        },
        { status: 401 }
      );
    }

    let channel = "PHONE";
    try {
      const body = await req.json();
      if (body?.channel && typeof body.channel === "string") {
        const c = body.channel.toUpperCase();
        if (c === "WHATSAPP" || c === "PHONE") {
          channel = c;
        }
      }
    } catch {
      // Body may be empty, defaults to "PHONE"
    }

    // Lookup worker by slug
    const worker = await prisma.workerProfile.findUnique({
      where: { slug },
      select: {
        id: true,
        full_name: true,
        phone: true,
        whatsapp_number: true,
        secondary_phone: true,
        status: true,
      },
    });

    if (!worker) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "NOT_FOUND",
            message: "মিস্ত্রির প্রোফাইল পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    // Rate Limiting: Check number of contact reveals in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentRevealsCount = await prisma.workerContactLog.count({
      where: {
        fk_user_id: user.id,
        created_at: { gte: oneDayAgo },
      },
    });

    if (recentRevealsCount >= DAILY_REVEAL_LIMIT) {
      return NextResponse.json(
        {
          data: null,
          error: {
            code: "RATE_LIMIT_EXCEEDED",
            message: "আপনার দৈনিক যোগাযোগের সীমা অতিক্রম হয়েছে। অনুগ্রহ করে পরবর্তীতে আবার চেষ্টা করুন।",
          },
        },
        { status: 429 }
      );
    }

    // Client metadata
    const forwardedFor = req.headers.get("x-forwarded-for");
    const ipAddress = forwardedFor ? forwardedFor.split(",")[0].trim() : req.headers.get("x-real-ip");
    const userAgent = req.headers.get("user-agent");

    // Deduplication: Avoid duplicate log entries within 5 minutes for the same user & worker
    const dedupThreshold = new Date(Date.now() - DEDUP_WINDOW_MS);
    const existingRecentLog = await prisma.workerContactLog.findFirst({
      where: {
        fk_worker_id: worker.id,
        fk_user_id: user.id,
        channel,
        created_at: { gte: dedupThreshold },
      },
    });

    if (!existingRecentLog) {
      await prisma.workerContactLog.create({
        data: {
          fk_worker_id: worker.id,
          fk_user_id: user.id,
          channel,
          ip_address: ipAddress ? ipAddress.slice(0, 100) : null,
          user_agent: userAgent || null,
        },
      });
    }

    return NextResponse.json(
      {
        data: {
          phone: worker.phone,
          whatsappNumber: worker.whatsapp_number,
          whatsapp_number: worker.whatsapp_number,
          secondaryPhone: worker.secondary_phone,
          fullName: worker.full_name,
        },
        error: null,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Worker contact reveal error:", error);
    return NextResponse.json(
      {
        data: null,
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "নম্বর প্রদর্শন করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
        },
      },
      { status: 500 }
    );
  }
}
