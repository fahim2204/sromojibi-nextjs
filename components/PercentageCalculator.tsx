"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, Input, Tab, Tabs } from "@nextui-org/react";
import FAQ from "@/components/FAQ";
import AdPlaceholder from "@/components/AdPlaceholder";

const percentageFAQs = [
  {
    question: "How do I calculate a percentage of a number?",
    answer: "To calculate a percentage of a number, convert the percentage into a decimal by dividing it by 100, then multiply that decimal by the number. For example, to find 20% of 50, you calculate 50 * 0.20 = 10."
  },
  {
    question: "How do I calculate percentage increase or decrease?",
    answer: "Percentage increase/decrease is calculated by finding the absolute difference between the two numbers, dividing that difference by the original number, and multiplying the result by 100. Formula: ((New Value - Old Value) / Old Value) * 100."
  },
  {
    question: "What is X as a percentage of Y?",
    answer: "To find what percentage X is of Y, simply divide the part (X) by the whole (Y) and multiply by 100. For example, 5 is 50% of 10 because (5/10) * 100 = 50%."
  },
  {
    question: "Why do retail discounts confuse people so often?",
    answer: "Retailers often stack percentages, which trips people up. If an item is 20% off, and you have a coupon for an additional 10% off, the total discount is NOT 30%. The second 10% is taken off the newly reduced price, resulting in mathematically less total savings than a flat 30% discount."
  }
];

type CalculationMode = "percentOf" | "whatPercent" | "increase";

export default function PercentageCalculator() {
  const [mode, setMode] = useState<CalculationMode>("percentOf");
  
  const [val1, setVal1] = useState("");
  const [val2, setVal2] = useState("");

  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    const v1 = parseFloat(val1);
    const v2 = parseFloat(val2);

    if (isNaN(v1) || isNaN(v2)) {
      setError("Please enter valid numbers");
      return;
    }

    let res = 0;

    if (mode === "percentOf") {
      // What is v1% of v2?
      res = (v1 / 100) * v2;
    } else if (mode === "whatPercent") {
      // v1 is what % of v2?
      if (v2 === 0) {
        setError("Cannot divide by zero");
        return;
      }
      res = (v1 / v2) * 100;
    } else if (mode === "increase") {
      // % change from v1 to v2
      if (v1 === 0) {
         setError("Initial value cannot be zero for percentage change");
         return;
      }
      res = ((v2 - v1) / v1) * 100;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate', {
        event_category: 'calculator',
        event_label: 'Percentage Calculator',
        calculator_mode: mode
      });
    }

    setResult(res);
  };

  const reset = () => {
    setResult(null);
    setError("");
    setVal1("");
    setVal2("");
  };

  const getResultText = () => {
    if (result === null) return "";
    if (mode === "percentOf") return `${val1}% of ${val2} equals ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(result)}`;
    if (mode === "whatPercent") return `${val1} is ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(result)}% of ${val2}`;
    if (mode === "increase") {
        const type = result > 0 ? "Increase" : "Decrease";
        return `${type} of ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 4 }).format(Math.abs(result))}%`;
    }
    return result;
  };

  // Auto-scroll to results
  useEffect(() => {
    if (result !== null) {
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
  }, [result]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 pb-20">
      <section className="pt-12 pb-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
            Universal Percentage Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Instantly solve complex percentage math, calculate retail markdowns, determine test scores, and analyze percentage growth or decline with precision.
          </p>

          <div className="max-w-xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
              <CardHeader className="flex flex-col gap-2 pb-4 pt-6 border-b border-gray-100 dark:border-gray-700">
                 <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 text-center md:text-left">Select Calculation Type</h2>
                 <Tabs 
                  selectedKey={mode} 
                  onSelectionChange={(key) => {
                    setMode(key as CalculationMode);
                    reset();
                  }}
                  color="primary"
                  variant="solid"
                  classNames={{
                    tabList: "bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 w-full flex-wrap md:flex-nowrap",
                    cursor: "bg-white dark:bg-gray-700 shadow-sm",
                    tabContent: "text-gray-600 dark:text-gray-400 group-data-[selected=true]:text-gray-900 dark:group-data-[selected=true]:text-white font-medium"
                  }}
                >
                  <Tab key="percentOf" title="% Of" />
                  <Tab key="whatPercent" title="What %" />
                  <Tab key="increase" title="% Change" />
                </Tabs>
              </CardHeader>
              <CardContent className="space-y-8 p-6">
                <div className="grid gap-6 items-center">
                  
                  {mode === "percentOf" && (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center text-gray-900 dark:text-gray-100 text-lg font-medium">
                        <span className="shrink-0 w-16 sm:text-right hidden sm:block">What is</span>
                        <Input
                          type="number"
                          placeholder="e.g., 20"
                          value={val1}
                          onValueChange={setVal1}
                          endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">%</span></div>}
                          variant="bordered"
                            classNames={{
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500 w-full sm:w-32",
                                input: "text-gray-900 dark:text-white text-center font-bold text-lg",
                            }}
                        />
                        <span className="shrink-0">of</span>
                        <Input
                          type="number"
                          placeholder="e.g., 50"
                          value={val2}
                          onValueChange={setVal2}
                          variant="bordered"
                            classNames={{
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500 w-full sm:w-32",
                                input: "text-gray-900 dark:text-white text-center font-bold text-lg",
                            }}
                        />
                        <span className="hidden sm:block">?</span>
                    </div>
                  )}

                   {mode === "whatPercent" && (
                    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center text-gray-900 dark:text-gray-100 text-lg font-medium">
                        <Input
                          type="number"
                          placeholder="e.g., 25"
                          value={val1}
                          onValueChange={setVal1}
                          variant="bordered"
                            classNames={{
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500 w-full sm:w-32",
                                input: "text-gray-900 dark:text-white text-center font-bold text-lg",
                            }}
                        />
                        <span className="shrink-0">is what % of</span>
                         <Input
                          type="number"
                          placeholder="e.g., 100"
                          value={val2}
                          onValueChange={setVal2}
                          variant="bordered"
                            classNames={{
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500 w-full sm:w-32",
                                input: "text-gray-900 dark:text-white text-center font-bold text-lg",
                            }}
                        />
                         <span className="hidden sm:block">?</span>
                    </div>
                  )}

                  {mode === "increase" && (
                    <div className="flex flex-col gap-6 text-gray-900 dark:text-gray-100 w-full">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <span className="font-semibold w-24">Starts at:</span>
                            <Input
                            type="number"
                            placeholder="Initial Value (e.g., 100)"
                            value={val1}
                            onValueChange={setVal1}
                            variant="bordered"
                                classNames={{
                                    inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500 sm:w-64",
                                    input: "text-gray-900 dark:text-white sm:text-right font-medium",
                                }}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                            <span className="font-semibold w-24">Ends at:</span>
                             <Input
                            type="number"
                            placeholder="Final Value (e.g., 150)"
                            value={val2}
                            onValueChange={setVal2}
                            variant="bordered"
                                classNames={{
                                    inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500 sm:w-64",
                                    input: "text-gray-900 dark:text-white sm:text-right font-medium",
                                }}
                            />
                        </div>
                    </div>
                  )}

                </div>

                {error && (
                  <div className="text-red-700 dark:text-red-300 text-sm font-medium bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-800 text-center">
                    {error}
                  </div>
                )}

                <Button 
                  onPress={handleCalculate}
                  className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors border-0"
                >
                  Calculate Now
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {result !== null && (
        <div className="container mx-auto px-4 py-12 space-y-12 max-w-5xl">
          <AdPlaceholder position="top" />

          <div id="results" className="max-w-2xl mx-auto">
             <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 text-center rounded-none shadow-sm">
               <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-widest border-b border-gray-100 dark:border-gray-700 pb-4">Mathematical Result</h3>
               <div className="text-4xl md:text-5xl font-extrabold text-blue-600 dark:text-blue-400 py-4">
                  {getResultText()}
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
            The Complete Guide to Percentage Math & Real-World Application
          </h2>
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              The word "percent" is derived from the Latin phrase <em>per centum</em>, which translates directly to "by the hundred." It is entirely a mathematical concept designed to express ratios as fractions of 100, standardizing exactly how humans understand growth, decline, and comparison metrics. Whether you are analyzing a corporate earnings report, leaving a tip at a restaurant, or trying to decipher Black Friday retail sales, understanding percentages is an inescapable daily requirement.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Decoding Retail Markdowns and "Stacked" Discounts</h3>
            <p>
              Retail stores frequently use psychological percentage games to make consumers believe they are securing a better deal than mathematically exists. The most common trap is the "stacked discount." 
            </p>
            <p>
              Imagine a $200 television goes on clearance for <strong>20% off</strong>. The new price is $160. Then, the store issues a coupon for <strong>an additional 10% off clearance items</strong>. Humans naturally err and assume 20% + 10% = 30% total discount (which would imply the TV costs $140). However, the second 10% discount is applied to the <em>new</em> amount of $160. Therefore, the total final price is $144. The true percentage discount is actually 28%, not 30%. In retail and taxes, order of operations matters fiercely.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Understanding The Base: Why 50% Up Does Not Equal 50% Down</h3>
            <p>
              A fundamental error many investors make involves the concept of "recovering" from a percentage decrease. Consider a scenario where you hold an individual stock valued at $100.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>If the stock market crashes and your stock drops by <strong>50%</strong>, your new value is $50.</li>
              <li>When the market recovers, does a <strong>50% increase</strong> return you to being whole? No. Since your new starting base is only $50, a 50% gain only adds $25, leaving you at $75.</li>
              <li>To recover from a 50% loss, the asset must actually surge by <strong>100%</strong> to climb back from $50 to $100. Always keep the initial foundation value in mind when analyzing percentage change.</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">The Power of the Base-10 Trick in Your Head</h3>
            <p>
              While our calculator is perfect for exact digital measurements, you can do rapid approximations by finding 10%. To find 10% of any number, mentally move the decimal point one place to the left. (E.g., 10% of $45.60 is $4.56). From there, you can easily double it to find 20%, halve it to find 5%, or multiply it by 3 to find 30% for quick restaurant tipping or commission estimates.
            </p>
          </div>
        </div>

        <FAQ items={percentageFAQs} />
      </article>
    </div>
  );
}
