import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if already subscribed
    const existing = await prisma.newsletterSubscriber.findUnique({
      where: { email: cleanEmail },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        alreadySubscribed: true,
        message: "You're already subscribed! We'll send you early access launch notifications.",
      });
    }

    // Save new subscriber to PostgreSQL
    const subscriber = await prisma.newsletterSubscriber.create({
      data: {
        email: cleanEmail,
        source: "homepage_newsletter",
      },
    });

    return NextResponse.json(
      {
        success: true,
        alreadySubscribed: false,
        message: "Thank you! You have successfully subscribed to Sromojibi launch updates.",
        data: {
          id: subscriber.id,
          email: subscriber.email,
          createdAt: subscriber.created_at,
          updatedAt: subscriber.updated_at,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error. Please try again later." },
      { status: 500 }
    );
  }
}
