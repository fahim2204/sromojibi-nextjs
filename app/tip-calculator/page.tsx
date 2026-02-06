
import TipCalculator from "@/components/TipCalculator";

export const metadata = {
    title: 'Tip Calculator - Calculate Gratuity & Split Bills Easily',
    description: 'Calculate the perfect tip and split bills among friends in seconds. Customize tip percentages and see the exact cost per person for any restaurant or service bill.',
    alternates: {
        canonical: "/tip-calculator",
    },
    openGraph: {
        url: "/tip-calculator",
        title: 'Tip Calculator - Gratuity & Bill Splitter Tool',
        description: 'Make dining out simpler. Calculate tips and divide the bill fairly among everyone.',
    },
};

export default function Page() {
  return <TipCalculator />;
}
