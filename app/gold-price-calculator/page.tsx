
import GoldPriceCalculator from "@/components/GoldPriceCalculator";

export const metadata = {
    title: 'Gold Price Calculator - Calculate Value by Weight & Purity',
    description: 'Determine the exact value of your gold based on weight, purity (24k, 22k, etc.), and current market rates. Supports grams, ounces, tolas and various gold karats.',
    alternates: {
        canonical: "/gold-price-calculator",
    },
    openGraph: {
        url: "/gold-price-calculator",
        title: 'Gold Price Calculator - Instant Gold Value Estimation',
        description: 'Calculate the worth of your gold ornaments or bullion with real-time accuracy.',
    },
};

export default function Page() {
  return <GoldPriceCalculator />;
}
