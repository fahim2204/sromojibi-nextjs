import type { Metadata } from "next";
import React from "react";

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://sromojibi.com";

export const metadata: Metadata = {
  title: "ফ্রি মিস্ত্রি নিবন্ধন - Join as a Worker",
  description:
    "শ্রমজীবী ডিরেক্টরিতে ফ্রি মিস্ত্রি প্রোফাইল নিবন্ধন করুন। ইলেকট্রিশিয়ান, প্লাম্বার, রাজমিস্ত্রি, টাইলস মিস্ত্রি সহ সকল দক্ষ কারিগরদের জন্য ফ্রি অনলাইন প্রোফাইল ও সরাসরি কাস্টমার কলের সুযোগ।",
  keywords: [
    "মিস্ত্রি নিবন্ধন",
    "worker registration bangladesh",
    "free worker profile bangladesh",
    "shromojibi mistri",
    "electrician registration",
    "plumber profile bangladesh",
    "rajmistri contact",
  ],
  alternates: {
    canonical: `${siteUrl}/join-worker`,
  },
  openGraph: {
    title: "ফ্রি মিস্ত্রি নিবন্ধন - Join as a Worker | Sromojibi",
    description:
      "শ্রমজীবী ডিরেক্টরিতে ফ্রি মিস্ত্রি প্রোফাইল নিবন্ধন করুন। কোনো হিডেন ফি ছাড়া কাস্টমারদের সরাসরি ফোন কল পাওয়ার সুবিধা নিন।",
    url: `${siteUrl}/join-worker`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ফ্রি মিস্ত্রি নিবন্ধন - Join as a Worker | Sromojibi",
    description:
      "শ্রমজীবী ডিরেক্টরিতে ফ্রি মিস্ত্রি প্রোফাইল নিবন্ধন করুন। সরাসরি কাস্টমারদের ফোন কল পান।",
  },
};

export default function JoinWorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
