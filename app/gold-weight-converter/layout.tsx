import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gold Weight Converter - Traditional Units to Grams",
  description:
    "Convert between traditional gold units (Vori, Ana, Roti, Point) and grams. Free online gold weight calculator with accurate conversions for jewelry and precious metals.",
  keywords: [
    "gold converter",
    "vori to grams",
    "ana to grams",
    "roti to grams",
    "point to grams",
    "traditional gold units",
    "gold weight calculator",
    "gold measurement converter",
    "jewelry weight converter",
    "precious metal converter",
  ],
  openGraph: {
    title: "Gold Weight Converter - Traditional Units to Grams | EZCalc",
    description:
      "Convert between traditional gold units (Vori, Ana, Roti, Point) and grams instantly. Accurate and free gold weight calculator.",
    type: "website",
    url: "https://ezcalc.xyz/gold-weight-converter",
  },
  twitter: {
    card: "summary_large_image",
    title: "Gold Weight Converter - Traditional Units to Grams | EZCalc",
    description:
      "Convert between traditional gold units (Vori, Ana, Roti, Point) and grams instantly. Free and accurate.",
  },
  alternates: {
    canonical: "https://ezcalc.xyz/gold-weight-converter",
  },
};

export default function GoldWeightConverterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
