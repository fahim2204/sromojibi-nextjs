"use client";

import { Card, CardBody as CardContent } from "@nextui-org/react";
import Link from "next/link";
import { useState } from "react";
import FAQ from "@/components/FAQ";
import {
  gramsToTraditional,
  traditionalToGrams,
  validateGrams,
  validateTraditionalUnits,
  type TraditionalUnits,
} from "@/lib/goldWeightConversions";

type ConversionMode = "toGrams" | "toTraditional";

const weightFAQs = [
  {
    question: "What is a Vori and where is it used?",
    answer: "A Vori (also spelled Bhori) is a traditional unit of mass used primarily in South Asia, including India, Pakistan, and Bangladesh, specifically for weighing gold and silver. One standard Vori is equal to 11.6638 grams."
  },
  {
    question: "How many Anas are in a Vori?",
    answer: "There are exactly 16 Anas in one Vori. The Ana is a subunit that allows jewelers to price out smaller pieces of gold or account for the exact melt weight."
  },
  {
    question: "What is the relationship between Roti and Point?",
    answer: "In the South Asian gold measurement system, 1 Ana is divided into 6 Rotis, and 1 Roti is further subdivided into 10 Points. Therefore, there are 960 Points in a single Vori. This granular system allows for extreme precision when trading precious metals."
  },
  {
    question: "Why do we still use traditional units instead of just Grams?",
    answer: "Cultural heritage and localized market norms keep these units alive. Many inherited pieces of jewelry have their weights documented in Vori and Ana on old receipts. Local goldsmiths in South Asia still quote making charges and spot prices based on the Vori standard rather than the international Troy Ounce or metric gram."
  }
];

export default function GoldWeightConverter() {
  const [mode, setMode] = useState<ConversionMode>("toGrams");

  // Traditional units state
  const [vori, setVori] = useState<string>("");
  const [ana, setAna] = useState<string>("");
  const [roti, setRoti] = useState<string>("");
  const [point, setPoint] = useState<string>("");
  const [gramsResult, setGramsResult] = useState<number | null>(null);

  // Grams state
  const [grams, setGrams] = useState<string>("");
  const [traditionalResult, setTraditionalResult] =
    useState<TraditionalUnits | null>(null);

  const [error, setError] = useState<string>("");

  const handleTraditionalToGrams = () => {
    setError("");
    const units: TraditionalUnits = {
      vori: parseFloat(vori) || 0,
      ana: parseFloat(ana) || 0,
      roti: parseFloat(roti) || 0,
      point: parseFloat(point) || 0,
    };

    const validation = validateTraditionalUnits(units);
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return;
    }

    const result = traditionalToGrams(units);
    setGramsResult(result);
  };

  const handleGramsToTraditional = () => {
    setError("");
    const gramsValue = parseFloat(grams);

    const validation = validateGrams(gramsValue);
    if (!validation.isValid) {
      setError(validation.errors.join(", "));
      return;
    }

    const result = gramsToTraditional(gramsValue);
    setTraditionalResult(result);
  };

  const clearTraditional = () => {
    setVori("");
    setAna("");
    setRoti("");
    setPoint("");
    setGramsResult(null);
    setError("");
  };

  const clearGrams = () => {
    setGrams("");
    setTraditionalResult(null);
    setError("");
  };

  const toggleMode = () => {
    setMode(mode === "toGrams" ? "toTraditional" : "toGrams");
    setError("");
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 pb-20">
      <section className="pt-12 pb-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto text-center max-w-4xl">
          <Link
            href="/"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium transition-colors mb-6"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back to Calculators
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
            Gold Weight Converter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Convert mathematically between traditional South Asian gold units (Vori, Ana, Roti, Point) and standard metric grams.
          </p>

          {/* Toggle Button */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="flex flex-col items-center gap-3">
              <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">Select conversion direction:</p>
              <button
                onClick={toggleMode}
                className="group relative px-8 py-4 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white rounded-md font-semibold text-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
              >
                <span className="flex items-center gap-4">
                  <span className="flex items-center gap-2">
                    <span className={`transition-opacity ${mode === "toGrams" ? "opacity-100 text-blue-600 dark:text-blue-400" : "opacity-50"}`}>
                      Traditional Units
                    </span>
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d={mode === "toGrams" ? "M13 7l5 5m0 0l-5 5m5-5H6" : "M11 17l-5-5m0 0l5-5m-5 5h12"}
                      />
                    </svg>
                    <span className={`transition-opacity ${mode === "toTraditional" ? "opacity-100 text-blue-600 dark:text-blue-400" : "opacity-50"}`}>
                      Grams
                    </span>
                  </span>
                </span>
              </button>
            </div>
          </div>

          {/* Converter Cards */}
          <div className="max-w-2xl mx-auto text-left">
            {mode === "toGrams" ? (
              <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
                <CardContent className="p-8">
                  <div className="relative mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Traditional Units → Grams
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                       Enter values in any combination below to convert.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    {/* Vori */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Vori
                      </label>
                      <input
                        type="number"
                        value={vori}
                        onChange={(e) => setVori(e.target.value)}
                        placeholder="0"
                        min="0"
                        step="1"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Ana */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Ana (0-15)
                      </label>
                      <input
                        type="number"
                        value={ana}
                        onChange={(e) => setAna(e.target.value)}
                        placeholder="0"
                        min="0"
                        max="15"
                        step="1"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Roti */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Roti (0-5)
                      </label>
                      <input
                        type="number"
                        value={roti}
                        onChange={(e) => setRoti(e.target.value)}
                        placeholder="0"
                        min="0"
                        max="5"
                        step="1"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      />
                    </div>

                    {/* Point */}
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Point (0-9)
                      </label>
                      <input
                        type="number"
                        value={point}
                        onChange={(e) => setPoint(e.target.value)}
                        placeholder="0"
                        min="0"
                        max="9"
                        step="1"
                        className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={handleTraditionalToGrams}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors border-0"
                    >
                      Calculate
                    </button>
                    <button
                      onClick={clearTraditional}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors border border-gray-300 dark:border-gray-600"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Result */}
                  {gramsResult !== null && (
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-center">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                        Equivalent Grams:
                      </p>
                      <p className="text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                        {gramsResult.toFixed(4)} <span className="text-lg text-gray-500">g</span>
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
                <CardContent className="p-8">
                  <div className="relative mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      Grams → Traditional Units
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Enter metric weight to extract traditional South Asian units.
                    </p>
                  </div>

                  <div className="mb-8">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                      Weight in Grams
                    </label>
                    <input
                      type="number"
                      value={grams}
                      onChange={(e) => setGrams(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.001"
                      className="w-full px-4 py-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
                    />
                  </div>

                  {error && (
                    <div className="mb-6 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-300 text-sm font-medium">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-4 mb-6">
                    <button
                      onClick={handleGramsToTraditional}
                      className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition-colors border-0"
                    >
                      Calculate
                    </button>
                    <button
                      onClick={clearGrams}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md font-medium transition-colors border border-gray-300 dark:border-gray-600"
                    >
                      Clear
                    </button>
                  </div>

                  {/* Result */}
                  {traditionalResult !== null && (
                    <div className="p-6 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-none text-center">
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4">
                        Equivalent Traditional Units:
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Vori</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{traditionalResult.vori}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Ana</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{traditionalResult.ana}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Roti</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{traditionalResult.roti}</p>
                        </div>
                        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700">
                          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1">Pt</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white">{traditionalResult.point}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* SEO Thick Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-none mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            The Complete Guide to Traditional Gold Weight Measurements
          </h2>
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Traditional gold weight measurements hold deep historical and cultural significance, particularly in South Asian jewelry markets (India, Bangladesh, Pakistan, and Nepal). Even as the metric system (grams and kilograms) becomes standard globally, local jewelers and generational families continue to estimate family heirlooms and set daily market spot prices using these classical units.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Historical Context & Accuracy</h3>
            <p>
              Before modern digital scales, goldsmiths relied on physical counterweights often derived from exact seeds, such as the Ratti seed. Today, these measurements have been strictly codified against the metric system. Converting accurately between Grams and traditional units is vital to prevent pricing disputes and ensure complete transparency when buying, selling, or appraising gold. 
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">The Unit Breakdown (The Formula)</h3>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>1 Vori (Bhori)</strong> = exactly 11.6638 Grams. This is the master unit.</li>
              <li><strong>1 Vori</strong> contains <strong>16 Ana</strong>.</li>
              <li><strong>1 Ana</strong> contains <strong>6 Roti</strong>.</li>
              <li><strong>1 Roti</strong> contains <strong>10 Points</strong>.</li>
            </ul>
            <p>
              By dividing 11.6638 grams by these fractions, jewelers can calculate weights down to the milligram, ensuring that even the smallest gemstone settings and gold shavings are accurately valued.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Why Use This Converter?</h3>
            <p>
              When inheriting gold or checking an old receipt, you might see a weight listed as "2 Vori, 4 Ana, 2 Roti". Without a digital calculator, manually finding the exact gram equivalent to check against today's international spot price is notoriously difficult. Our dual-directional calculator allows you to input those exact broken-down units to get the precise metric gram total instantly.
            </p>
          </div>
        </div>

        <FAQ items={weightFAQs} />
      </article>
    </main>
  );
}
