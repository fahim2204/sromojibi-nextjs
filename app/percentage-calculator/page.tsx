
import PercentageCalculator from "@/components/PercentageCalculator";

export const metadata = {
    title: 'Percentage Calculator - Calculate Percentages, Increases & Decreases',
    description: 'Quickly calculate percentage increases, decreases, and differences. Find what percentage X is of Y or solve for percentage values with our easy-to-use tool.',
    alternates: {
        canonical: "/percentage-calculator",
    },
    openGraph: {
        url: "/percentage-calculator",
        title: 'Percentage Calculator - Fast & Accurate Results',
        description: 'Calculate any percentage problem instantly, from discounts to growth rates.',
    },
};

export default function Page() {
  return <PercentageCalculator />;
}
