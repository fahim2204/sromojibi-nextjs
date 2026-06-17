import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Grade Calculator - Weighted Average & Final Exam Grade",
  description: "Calculate your weighted average grade or find out what score you need on your final exam to achieve your target class grade. Supports percentages, letters, and points.",
  alternates: {
    canonical: "/grade-calculator",
  },
  openGraph: {
    url: "/grade-calculator",
    title: "Grade Calculator - Weighted Average & Final Exam Grade",
    description: "Calculate your weighted average grade or find out what score you need on your final exam to achieve your target class grade. Supports percentages, letters, and points.",
  },
};

export default function GradeCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
