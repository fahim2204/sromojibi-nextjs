import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Age Calculator - Find Your Exact Age & Life Insights",
  description: "Calculate your exact age in years, months, and days. Explore unique life insights, consumption statistics, and discover which famous historical figures share your birthday.",
  alternates: {
    canonical: "/age-calculator",
  },
  openGraph: {
    url: "/age-calculator",
    title: "Age Calculator - Find Your Exact Age & Life Insights",
    description: "Calculate your exact age and discover fascinating life facts instantly.",
  },
};

export default function AgeCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
