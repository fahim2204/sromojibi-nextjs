"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, Input, Tab, Tabs } from "@nextui-org/react";
import FAQ from "@/components/FAQ";
import AdPlaceholder from "@/components/AdPlaceholder";

const landFAQs = [
  {
    question: "How do I calculate land area?",
    answer: "Land area calculation depends on the shape of the land plot. For square or rectangular plots, multiply the length by the width. For triangular plots, use half of the base multiplied by the height. For irregular shapes, land surveyors mathematically divide the plot into smaller standard shapes (triangles and rectangles), calculate each individually, and sum the total."
  },
  {
    question: "What is an Acre?",
    answer: "An Acre is a primary unit of land area used in the imperial and US customary systems. Historically, it was defined as the amount of land a yoke of oxen could plow in one day. Scientifically, it is defined as exactly 43,560 square feet, or roughly the size of a standard American football field without the end zones."
  },
  {
    question: "What is a Hectare?",
    answer: "A Hectare is a metric unit of square measure, legally defined as 10,000 square meters (or a square with 100-meter sides). It is the primary legal unit of land measurement across the European Union, Australia, and most international real estate markets. One Hectare equals roughly 2.471 Acres."
  },
  {
    question: "Why does my property deed use different units than the tax assessor?",
    answer: "Different municipalities adopted different measurement standards over time. Older deeds often use traditional surveyor chains or links, while modern tax assessors utilize GIS software that calculates exact square footage or decimal acreage. Our calculator bridges that gap by providing simultaneous conversions for both systems."
  }
];

type Shape = "rectangle" | "triangle" | "circle";

export default function LandCalculator() {
  const [shape, setShape] = useState<Shape>("rectangle");
  
  // Rectangle
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");

  // Triangle
  const [base, setBase] = useState("");
  const [height, setHeight] = useState("");

  // Circle
  const [radius, setRadius] = useState("");

  const [resultSqFt, setResultSqFt] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    let area = 0;

    if (shape === "rectangle") {
      if (!length || !width) {
        setError("Please enter length and width");
        return;
      }
      area = parseFloat(length) * parseFloat(width);
    } else if (shape === "triangle") {
      if (!base || !height) {
        setError("Please enter base and height");
        return;
      }
      area = 0.5 * parseFloat(base) * parseFloat(height);
    } else if (shape === "circle") {
      if (!radius) {
         setError("Please enter radius");
         return;
      }
      area = Math.PI * Math.pow(parseFloat(radius), 2);
    }

    if (isNaN(area) || area <= 0) {
      setError("Please check your inputs and ensure they are positive numbers");
      return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate', {
        event_category: 'calculator',
        event_label: 'Land Calculator',
        calculator_mode: shape
      });
    }

    setResultSqFt(area);
  };

  const reset = () => {
    setResultSqFt(null);
    setError("");
  };

  // Auto-scroll to results
  useEffect(() => {
    if (resultSqFt !== null) {
      const resultsElement = document.getElementById("results");
      if (resultsElement) {
        setTimeout(() => {
          const elementPosition = resultsElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 100;
          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
          });
        }, 100);
      }
    }
  }, [resultSqFt]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 pb-20">
      <section className="pt-12 pb-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
            Land Area Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Determine exact land area for various plot shapes (rectangles, triangles, circles) and instantly convert between international metric and imperial systems.
          </p>

          <div className="max-w-xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
              <CardHeader className="flex flex-col gap-2 pb-4 pt-6 border-b border-gray-100 dark:border-gray-700">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">Select Plot Shape</h2>
                 <Tabs 
                  selectedKey={shape} 
                  onSelectionChange={(key) => {
                    setShape(key as Shape);
                    reset();
                  }}
                  color="primary"
                  variant="solid"
                  classNames={{
                    tabList: "bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
                    cursor: "bg-white dark:bg-gray-700 shadow-sm",
                    tabContent: "text-gray-600 dark:text-gray-400 group-data-[selected=true]:text-gray-900 dark:group-data-[selected=true]:text-white font-medium"
                  }}
                >
                  <Tab key="rectangle" title="Rectangle" />
                  <Tab key="triangle" title="Triangle" />
                  <Tab key="circle" title="Circle" />
                </Tabs>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-6">
                  {shape === "rectangle" && (
                     <div className="flex gap-4">
                        <Input
                          type="number"
                          label="Length (ft)"
                          placeholder="e.g., 150"
                          value={length}
                          onValueChange={setLength}
                          variant="bordered"
                          classNames={{
                            inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                            label: "text-gray-700 dark:text-gray-300 font-medium",
                            input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                          }}
                        />
                        <Input
                          type="number"
                          label="Width (ft)"
                          placeholder="e.g., 100"
                          value={width}
                          onValueChange={setWidth}
                          variant="bordered"
                          classNames={{
                            inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                            label: "text-gray-700 dark:text-gray-300 font-medium",
                            input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                          }}
                        />
                     </div>
                  )}
                  {shape === "triangle" && (
                     <div className="flex gap-4">
                        <Input
                          type="number"
                          label="Base (ft)"
                          placeholder="e.g., 120"
                          value={base}
                          onValueChange={setBase}
                          variant="bordered"
                          classNames={{
                            inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                            label: "text-gray-700 dark:text-gray-300 font-medium",
                            input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                          }}
                        />
                        <Input
                          type="number"
                          label="Height (ft)"
                          placeholder="e.g., 80"
                          value={height}
                          onValueChange={setHeight}
                          variant="bordered"
                          classNames={{
                            inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                            label: "text-gray-700 dark:text-gray-300 font-medium",
                            input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                          }}
                        />
                     </div>
                  )}
                  {shape === "circle" && (
                     <Input
                          type="number"
                          label="Radius (ft)"
                          placeholder="e.g., 50"
                          value={radius}
                          onValueChange={setRadius}
                          variant="bordered"
                          classNames={{
                            inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                            label: "text-gray-700 dark:text-gray-300 font-medium",
                            input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                          }}
                        />
                  )}
                </div>

                {error && (
                  <div className="text-red-700 dark:text-red-300 text-sm font-medium bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-800 text-center">
                    {error}
                  </div>
                )}

                <Button 
                  onPress={handleCalculate}
                  className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors border-0 mt-2"
                >
                  Calculate Area
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {resultSqFt !== null && (
        <div className="container mx-auto px-4 py-12 space-y-12 max-w-5xl">
          <AdPlaceholder position="top" />

          <div id="results" className="max-w-4xl mx-auto grid md:grid-cols-2 gap-6">
             <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-none shadow-sm">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">Metric Units</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-700 pb-3">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Square Meters</span>
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(resultSqFt * 0.092903)} <span className="text-sm text-gray-500">m²</span>
                      </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-700 pb-3">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Hectares</span>
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(resultSqFt * 0.0000092903)} <span className="text-sm text-gray-500">ha</span>
                      </span>
                  </div>
               </div>
             </Card>

             <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-none shadow-sm">
               <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">Imperial Units</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-700 pb-3">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Square Feet</span>
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(resultSqFt)} <span className="text-sm text-gray-500">ft²</span>
                      </span>
                  </div>
                  <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-700 pb-3">
                      <span className="text-gray-600 dark:text-gray-400 font-medium">Acres</span>
                      <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">
                        {new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(resultSqFt / 43560)} <span className="text-sm text-gray-500">ac</span>
                      </span>
                  </div>
               </div>
             </Card>
          </div>

          <AdPlaceholder position="bottom" />
        </div>
      )}

      {/* SEO Thick Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-none mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            The Comprehensive Guide to Land Area Calculation and Conversion
          </h2>
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Whether you are purchasing a new home, planning a farming subdivision, or installing a backyard fence, understanding your exact land area is the foundational step of real estate management. However, dealing with property deeds spanning multiple decades (or crossing international borders) often means deciphering a confusing mix of metric and imperial unit standards.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Decoding the Formulas: Rectangle vs. Triangle</h3>
            <p>
              The geometry of land surveying dictates that plots rarely exist in perfect squares. Municipal lots are typically rectangles, requiring a simple Length × Width calculation (e.g., a 100 ft by 50 ft lot is exactly 5,000 square feet). 
            </p>
            <p>
              Conversely, suburban cul-de-sacs or agricultural plots often feature sharp angles creating triangular boundaries. To find the area of a triangular plot, you must identify a straight baseline and calculate the highest perpendicular point (the height), then apply the standard formula: <code>½ × Base × Height</code>. For hyper-irregular plots, municipal surveyors utilize complex polygon algorithms via satellite GPS (GIS systems), outputting a final acreage that our calculator can easily convert into manageable square footage for builders.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">The Global Divide: Acres vs. Hectares</h3>
            <p>
              Understanding the difference between an Acre and a Hectare is vital for international real estate data. 
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>The Acre:</strong> Used exclusively in the US, UK, and former Commonwealth territories attached to the imperial system. One acre is defined as 43,560 square feet. Because early surveying was based on linear "chains," an acre originally represented an area one chain (66 ft) wide by one furlong (660 ft) long.</li>
              <li><strong>The Hectare:</strong> The legal standard of the global metric system. Derived from the Greek word for hundred (hecaton) and the "are" metric unit. A hectare is exactly 10,000 square meters. Because metric runs on a base-10 system, moving between square meters and hectares simply involves moving a decimal point.</li>
            </ul>
            <p className="mt-4 font-medium text-gray-900 dark:text-white">
              Quick Conversion Rule of Thumb: 1 Hectare is nearly two and a half times larger than a standard Acre (~2.47 Acres).
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Why Accurate Computation Matters</h3>
            <p>
              Inaccurate area calculation can lead to disastrous financial consequences. Property taxes are assessed primarily on exact square footage. Miscalculating a triangular boundary could mean overpaying property taxes for decades, or conversely, buying far too little topsoil and sod for a landscaping project. Utilizing an exact digital calculator prevents these costly mathematical errors.
            </p>
          </div>
        </div>

        <FAQ items={landFAQs} />
      </article>
    </div>
  );
}
