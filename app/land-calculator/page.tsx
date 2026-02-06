
import LandCalculator from "@/components/LandCalculator";

export const metadata = {
    title: 'Land Calculator - Calculate Area & Convert Units (Sq Ft, Acres)',
    description: 'Calculate land area for various shapes including rectangles, triangles, and circles. Effortlessly convert between square feet, square meters, acres, hectares, and more.',
    alternates: {
        canonical: "/land-calculator",
    },
    openGraph: {
        url: "/land-calculator",
        title: 'Land Calculator - Accurate Area & Unit Conversion',
        description: 'Need to measure property? Use our free tool for land area calculations and unit conversions.',
    },
};

export default function Page() {
  return <LandCalculator />;
}
