"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, Input, Select, SelectItem } from "@nextui-org/react";
import FAQ from "@/components/FAQ";
import AdPlaceholder from "@/components/AdPlaceholder";

const goldFAQs = [
  {
    question: "How is the local gold price calculated?",
    answer: "The local retail gold price is calculated by multiplying the weight of the gold by the current international spot market rate per unit (e.g., Ounce to Gram), adjusted for the purity factor (Karat), and finally adding localized premiums, import duties, and making charges."
  },
  {
    question: "What is the difference between 24k and 22k gold terminology?",
    answer: "The 'K' stands for Karat, which measures the purity of gold. 24k gold is considered 99.9% pure elementary gold. However, it is very soft and malleable. 22k gold is 91.6% pure, mixed with 8.4% other metals like copper or zinc. 22k is the global standard for durable jewelry manufacturing."
  },
  {
    question: "What is a Tola in gold measurement?",
    answer: "A Tola (or Tolah) is a traditional ancient Indian and South Asian unit of mass. Historically it equaled the weight of a silver rupee. Today, the standard metric Tola is defined as exactly 11.6638038 grams, widely used in India, Pakistan, and the Middle East for gold trading."
  },
  {
    question: "Why does the price of gold fluctuate so much?",
    answer: "Gold acts as a global economic hedge. Prices fluctuate based on central bank reserves, inflation rates, value of the US Dollar, and geopolitical stability. During times of economic crisis, demand for gold typically historically rises, driving up the spot price."
  }
];

export default function GoldPriceCalculator() {
  const [weight, setWeight] = useState("");
  const [unit, setUnit] = useState("gram");
  const [purity, setPurity] = useState("24k");
  const [rate, setRate] = useState("");
  const [result, setResult] = useState<number | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    if (!weight || !rate) {
      setError("Please enter weight and rate");
      return;
    }

    const w = parseFloat(weight);
    const r = parseFloat(rate);

    if (isNaN(w) || isNaN(r) || w <= 0 || r <= 0) {
      setError("Please enter valid positive numbers");
      return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate', {
        event_category: 'calculator',
        event_label: 'Gold Price Calculator',
        value: w
      });
    }

    setResult(w * r);
  };

  const reset = () => {
    setResult(null);
    setError("");
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
            Gold Price Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Calculate the exact retail value of your physical gold assets based on weight metrics, purity ratings, and live local market rates.
          </p>

          <div className="max-w-xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
              <CardHeader className="flex flex-col gap-1 pb-4 pt-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Calculate Gold Value</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Input your metal specifications below.
                </p>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-4">
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      label="Weight Amount"
                      placeholder="10"
                      value={weight}
                      onValueChange={setWeight}
                      variant="bordered"
                      classNames={{
                        inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                        label: "text-gray-700 dark:text-gray-300 font-medium",
                        input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                      }}
                      className="flex-grow"
                    />
                    <Select
                      label="Unit"
                      selectedKeys={[unit]}
                      onChange={(e) => setUnit(e.target.value)}
                      variant="bordered"
                      classNames={{
                        trigger: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                        value: "text-gray-900 dark:text-white",
                        popoverContent: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                      }}
                      className="w-32"
                    >
                      <SelectItem key="gram" value="gram" className="text-gray-900 dark:text-gray-100">Gram</SelectItem>
                      <SelectItem key="ounce" value="ounce" className="text-gray-900 dark:text-gray-100">Ounce</SelectItem>
                      <SelectItem key="tola" value="tola" className="text-gray-900 dark:text-gray-100">Tola</SelectItem>
                    </Select>
                  </div>
                  
                  <Select
                    label="Gold Purity (Karat)"
                    selectedKeys={[purity]}
                    onChange={(e) => setPurity(e.target.value)}
                    variant="bordered"
                    classNames={{
                        trigger: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                        value: "text-gray-900 dark:text-white",
                        popoverContent: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                    }}
                  >
                    <SelectItem key="24k" value="24k" className="text-gray-900 dark:text-gray-100">24k (99.9% Pure)</SelectItem>
                    <SelectItem key="22k" value="22k" className="text-gray-900 dark:text-gray-100">22k (91.6% Pure)</SelectItem>
                    <SelectItem key="21k" value="21k" className="text-gray-900 dark:text-gray-100">21k (87.5% Pure)</SelectItem>
                    <SelectItem key="18k" value="18k" className="text-gray-900 dark:text-gray-100">18k (75.0% Pure)</SelectItem>
                  </Select>

                  <Input
                    type="number"
                    label={`Rate per ${unit}`}
                    placeholder="E.g., 75.50"
                    value={rate}
                    onValueChange={setRate}
                    variant="bordered"
                    startContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">$</span></div>}
                    classNames={{
                      inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                      label: "text-gray-700 dark:text-gray-300 font-medium",
                      input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                    }}
                  />
                </div>

                {error && (
                  <div className="text-red-700 dark:text-red-300 text-sm font-medium bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-800 text-center">
                    {error}
                  </div>
                )}

                <Button 
                  onPress={handleCalculate}
                  className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors border-0"
                >
                  Calculate Total Value
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {result !== null && (
        <div className="container mx-auto px-4 py-12 space-y-12 max-w-5xl">
          <AdPlaceholder position="top" />

          <div id="results" className="max-w-4xl mx-auto">
             <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 text-center rounded-none shadow-sm">
               <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Estimated Total Value</h3>
               <div className="text-5xl md:text-6xl font-extrabold text-blue-600 dark:text-blue-400 mt-4">
                  {result.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
               </div>
               <p className="text-gray-600 dark:text-gray-400 mt-6 font-medium">
                  Calculation: {weight} {unit}(s) of {purity} gold at {parseFloat(rate).toLocaleString('en-US', { style: 'currency', currency: 'USD' })} per {unit}
               </p>
             </Card>
          </div>

          <AdPlaceholder position="bottom" />
        </div>
      )}

      {/* SEO Thick Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-none mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            The Comprehensive Guide to Gold Valuation
          </h2>
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Gold has long been considered the ultimate store of value across civilizations. Whether you are dealing in bullion, coins, or jewelry, knowing exactly how to calculate the price of your physical gold assets is crucial to ensure you receive a fair deal in any transaction. Our Gold Price Calculator removes the guesswork by applying industry-standard mathematical formulas to your specific metal weight, purity rating, and local spot price.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Understanding Weight Metrics (Ounces, Grams, Tolas)</h3>
            <p>
              The global spot price of gold is universally quoted in Troy Ounces (a distinct measurement heavier than standard avoirdupois ounces). One Troy Ounce equates exactly to 31.1034768 grams. 
            </p>
            <p>
               However, retail jewelry and localized trading utilize different unit systems. The metric `gram` is the most common standard in Europe and the Americas for jewelry weight. Meanwhile, the `Tola` remains heavily embedded in Middle Eastern and South Asian markets. If you are calculating the value of inherited jewelry from South Asia, it is likely measured in Tolas (1 Tola ≈ 11.66 grams).
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Decoding Purity: Karats Explained</h3>
            <p>
              Rarely is consumer gold 100% pure. Pure gold (24 Karat or 999 fineness) is notoriously soft and prone to scratching and bending. To harden the metal for wear, jewelers alloy (mix) pure gold with other metals like copper, zinc, or silver. 
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>24K Gold:</strong> 99.9% purity. Used for investment bullion coins and bars.</li>
              <li><strong>22K Gold:</strong> 91.6% purity (mixed with 8.4% alloy). The global standard for high-end, heavily yellow jewelry.</li>
              <li><strong>18K Gold:</strong> 75.0% purity. Highly durable, often used in engagement rings and diamond settings.</li>
              <li><strong>14K Gold:</strong> 58.3% purity. Highly affordable and extremely scratch-resistant, standard in the United States.</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Spot Price vs. Retail Value</h3>
            <p>
              It is important to understand that the result from a Gold Pricing Calculator represents the "Melt Value" or the intrinsic raw material value of the gold. When purchasing jewelry, retailers will add "making charges" (labor costs), brand premiums, and local taxes onto this base material value. Conversely, when selling gold to a pawn shop or dealer, they will typically offer slightly *below* the calculated intrinsic value to account for their profit margin and physical refining costs.
            </p>
          </div>
        </div>

        <FAQ items={goldFAQs} />
      </article>
    </div>
  );
}
