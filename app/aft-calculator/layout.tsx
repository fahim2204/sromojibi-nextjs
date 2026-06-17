import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AFT Calculator - Army Fitness Test Score Calculator (2026)",
  description: "Calculate your Army Fitness Test (AFT) score easily with our free tool. Get instant results for MDL, HRP, SDC, Plank, and Two-Mile Run according to the latest 2025 Army standards.",
  alternates: {
    canonical: "/aft-calculator",
  },
  openGraph: {
    url: "/aft-calculator",
    title: "AFT Calculator - Army Fitness Test Score Calculator (2026)",
    description: "Check your AFT score instantly with our free, easy-to-use calculator.",
  },
};

export default function AFTCalculatorLayout({
  children,
  }: {
  children: React.ReactNode;
}) {
  return children;
}
