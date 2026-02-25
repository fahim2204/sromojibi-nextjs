"use client";

import { Card, CardBody as CardContent } from "@nextui-org/react";
import Link from "next/link";
import { useState } from "react";

interface CalculatorCard {
  title: string;
  description: string;
  icon: string;
  href: string;
  tags: string[];
}

const calculators: CalculatorCard[] = [
  {
    title: "Age Calculator",
    description:
      "Calculate your exact age in years, months, and days. Discover life insights and famous birthdays.",
    icon: "🎂",
    href: "/age-calculator",
    tags: ["age", "birthday", "date", "time", "years"],
  },
  {
    title: "BMI Calculator",
    description:
      "Calculate your Body Mass Index and understand your health status with detailed insights.",
    icon: "💪",
    href: "/bmi-calculator",
    tags: ["bmi", "health", "weight", "fitness", "body"],
  },
  {
    title: "Gold Price Calculator",
    description:
      "Calculate gold prices, convert between different units, and track precious metal values.",
    icon: "🥇",
    href: "/gold-price-calculator",
    tags: ["gold", "price", "metal", "investment", "currency"],
  },
  {
    title: "Gold Weight Converter",
    description:
      "Convert between traditional gold units (Vori, Ana, Roti, Point) and grams instantly.",
    icon: "⚖️",
    href: "/gold-weight-converter",
    tags: ["gold", "converter", "vori", "ana", "weight", "traditional units"],
  },
  {
    title: "Land Calculator",
    description:
      "Calculate land area, convert between different units, and measure property dimensions.",
    icon: "🏞️",
    href: "/land-calculator",
    tags: ["land", "area", "property", "measurement", "real estate"],
  },
  {
    title: "Loan Calculator",
    description:
      "Calculate loan payments, interest rates, and amortization schedules for any loan type.",
    icon: "💰",
    href: "/loan-calculator",
    tags: ["loan", "finance", "interest", "payment", "debt"],
  },
  {
    title: "Mortgage Calculator",
    description:
      "Calculate monthly mortgage payments, total interest, and plan your home purchase.",
    icon: "🏠",
    href: "/mortgage-calculator",
    tags: ["mortgage", "home", "property", "finance", "payment"],
  },
  {
    title: "Percentage Calculator",
    description:
      "Calculate percentages, percentage increase/decrease, and solve percentage problems.",
    icon: "📊",
    href: "/percentage-calculator",
    tags: ["percentage", "math", "calculation", "ratio", "proportion"],
  },
  {
    title: "Tip Calculator",
    description:
      "Calculate tips, split bills, and determine fair gratuity amounts for any service.",
    icon: "🍽️",
    href: "/tip-calculator",
    tags: ["tip", "gratuity", "bill", "restaurant", "service"],
  },
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter calculators based on search query
  const filteredCalculators = calculators.filter((calculator) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    return (
      calculator.title.toLowerCase().includes(query) ||
      calculator.description.toLowerCase().includes(query) ||
      calculator.tags.some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <header className="text-center mb-10 pb-6 border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3 text-gray-900 dark:text-white">
            EZCalc - Calculate Everything
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 mb-2">
            Free Online Calculators for Every Need
          </p>
          <p className="text-base text-gray-500 dark:text-gray-500 max-w-3xl mx-auto">
            Calculate, convert, and compute with our comprehensive collection of
            free online calculators. Fast, accurate, and easy to use.
          </p>
        </header>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="relative flex items-center">
            <input
              type="text"
              id="search-calculators"
              aria-label="Search calculators"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search calculators..."
              className="w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                title="Clear search"
                className="absolute right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
              Found {filteredCalculators.length} result{filteredCalculators.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Calculator Grid */}
        <section aria-label="Available Calculators" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {filteredCalculators.length > 0 ? (
            filteredCalculators.map((calculator) => (
              <Link 
                key={calculator.href}
                href={calculator.href}
                title={`Go to ${calculator.title}`}
                className="block h-full group outline-none"
                onClick={() => {
                  if (typeof window !== 'undefined' && (window as any).gtag) {
                    (window as any).gtag('event', 'tool_click', {
                      event_category: 'calculator',
                      event_label: calculator.title,
                      tool_name: calculator.title
                    });
                  }
                }}
              >
                <Card className="h-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-sm hover:shadow-md hover:border-blue-400 dark:hover:border-blue-500 transition-all">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="text-3xl shrink-0" aria-hidden="true">
                      {calculator.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold mb-1 text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {calculator.title}
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                        {calculator.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          ) : (
            <div className="col-span-full py-12 text-center border border-gray-200 dark:border-gray-800 rounded-md bg-gray-50 dark:bg-gray-900/50">
              <p className="text-gray-600 dark:text-gray-400 mb-4">No calculators found for "{searchQuery}"</p>
              <button
                onClick={() => setSearchQuery("")}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                Clear Search
              </button>
            </div>
          )}
        </section>

        {/* SEO Content */}
        <article className="max-w-4xl mx-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-md p-6 md:p-8 mt-12 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Free Online Calculators by EZCalc
          </h2>
          <div className="text-gray-700 dark:text-gray-300 space-y-4 text-sm md:text-base leading-relaxed">
            <p>
              Welcome to EZCalc - your one-stop destination for free, accurate,
              and easy-to-use online calculators. Whether you need to calculate
              your age, determine your BMI, convert units, or solve complex
              financial equations, we have the perfect calculator for you.
            </p>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
              Our Calculator Collection:
            </h3>
            <ul className="list-disc list-inside space-y-1.5 text-gray-600 dark:text-gray-400 pl-2">
              <li>
                <strong className="text-gray-900 dark:text-gray-200">Age Calculator</strong> - Calculate your exact age with life insights and famous birthdays
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-200">BMI Calculator</strong> - Determine your Body Mass Index and health status
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-200">Gold Price Calculator</strong> - Track and convert gold prices in real-time
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-200">Land Calculator</strong> - Calculate land area and convert between measurement units
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-200">Loan Calculator</strong> - Calculate loan payments, interest, and amortization
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-200">Mortgage Calculator</strong> - Plan your home purchase with detailed mortgage calculations
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-200">Percentage Calculator</strong> - Solve percentage problems and conversions
              </li>
              <li>
                <strong className="text-gray-900 dark:text-gray-200">Tip Calculator</strong> - Calculate tips and split bills easily
              </li>
            </ul>
            <p className="mt-6">
              All our calculators are completely free to use, require no
              registration, and provide instant, accurate results. We're
              constantly adding new calculators to help you with your everyday
              calculations and complex computations.
            </p>
            <p className="mt-4">
              EZCalc is designed with user experience in mind - fast loading
              times, simple interfaces, and mobile-friendly designs ensure
              you can calculate anything seamlessly.
            </p>
          </div>
        </article>

        {/* Footer */}
        <footer className="mt-16 text-center text-gray-500 dark:text-gray-500 text-sm border-t border-gray-200 dark:border-gray-800 pt-8 pb-4">
          <div className="flex justify-center flex-wrap gap-x-6 gap-y-3 mb-6">
            <Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
              About
            </Link>
            <Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
              Contact
            </Link>
            <Link href="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
              Terms of Service
            </Link>
          </div>
          <p>© 2025 EZCalc. All rights reserved.</p>
          <p className="mt-1">
            Free online calculators for age, BMI, gold prices, land area, loans, and more.
          </p>
        </footer>
      </div>
    </main>
  );
}
