import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Calorie Calculator - Daily BMR & TDEE Caloric Intake",
  description: "Calculate your daily calorie needs for weight loss, gain, or maintenance using our free tool. Supports Mifflin-St Jeor and Harris-Benedict formulas.",
  alternates: {
    canonical: "/calorie-calculator",
  },
  openGraph: {
    url: "/calorie-calculator",
    title: "Calorie Calculator - Daily BMR & TDEE Caloric Intake",
    description: "Calculate your daily calorie needs for weight loss, gain, or maintenance using our free tool. Supports Mifflin-St Jeor and Harris-Benedict formulas.",
  },
};

export default function CalorieCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
