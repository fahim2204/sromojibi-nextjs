import { Card, CardBody as CardContent } from "@nextui-org/react";
import Link from "next/link";

export const metadata = {
  title: "About Us",
  description: "Learn about EZCalc's mission to provide free, accurate, and easy-to-use online calculators for everyone.",
  alternates: {
    canonical: "https://ezcalc.xyz/about",
  },
  openGraph: {
    url: "https://ezcalc.xyz/about",
  },
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">About EZCalc</h1>
          <p className="text-xl text-gray-400">Simplifying calculations for everyone, everywhere.</p>
        </div>

        <Card className="glass-strong mb-8">
          <CardContent className="p-8 text-gray-300 space-y-6">
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Our Mission</h2>
              <p>
                At EZCalc, we believe that complex calculations shouldn't be a barrier to making informed decisions. 
                Whether you're planning a mortgage, tracking your health tailored to your body type, or just curious about 
                how many days you've been alive, we're here to provide instant, accurate, and free answers.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Why Choose EZCalc?</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong className="text-purple-400">100% Free:</strong> No hidden fees, no subscriptions.</li>
                <li><strong className="text-purple-400">Privacy Focused:</strong> Calculations happen right in your browser. We don't store your personal data.</li>
                <li><strong className="text-purple-400">Fast & Accurate:</strong> Optimized for speed and precision.</li>
                <li><strong className="text-purple-400">Easy to Use:</strong> Clean, intuitive interfaces designed for everyone.</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">Our Calculators</h2>
              <p className="mb-4">
                We are constantly expanding our library. Currently, we offer tools for:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Age & Life Insights</li>
                  <li>Health (BMI)</li>
                  <li>Finance (Loans, Mortgages)</li>
                </ul>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Real Estate (Land Area)</li>
                  <li>Daily Utilities (Tips, Percentages)</li>
                  <li>Investments (Gold Price)</li>
                </ul>
              </div>
            </section>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link 
            href="/"
            className="inline-block px-8 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  );
}
