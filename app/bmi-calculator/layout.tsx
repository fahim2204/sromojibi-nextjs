import { Metadata } from "next";

export const metadata: Metadata = {
  title: "BMI Calculator - Calculate Body Mass Index & Ideal Weight",
  description: "Calculate your Body Mass Index (BMI) easily with our free tool. Get insights into your health status, find your ideal weight range, and understand the BMI categories for adults.",
  alternates: {
    canonical: "/bmi-calculator",
  },
  openGraph: {
    url: "/bmi-calculator",
    title: "BMI Calculator - Calculate Body Mass Index & Ideal Weight",
    description: "Check your BMI and health status instantly with our easy-to-use calculator.",
  },
};

export default function BMICalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
