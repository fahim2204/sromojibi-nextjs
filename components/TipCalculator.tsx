"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, Input, Slider } from "@nextui-org/react";
import FAQ from "@/components/FAQ";
import AdPlaceholder from "@/components/AdPlaceholder";

const tipFAQs = [
  {
    question: "How much should I tip?",
    answer: "In the United States, standard tipping etiquette dictates 15% to 20% for standard sit-down restaurant service. For exceptional or high-end service, 20% to 25% is increasingly common."
  },
  {
    question: "Should I calculate the tip before or after tax?",
    answer: "Etiquette experts universally agree that a tip should be calculated based on the pre-tax bill amount. You are tipping on the service provided, not paying a percentage on the government's tax surcharge."
  },
  {
    question: "Does this calculator handle split bills?",
    answer: "Yes, our calculator flawlessly handles split bills. Simply enter the total number of people in your party, and the tool will automatically divide both the tip and the final total cost evenly among everyone."
  },
  {
    question: "Do I need to tip on takeout orders?",
    answer: "Tipping on takeout is highly debated. While not strictly required like sit-down service, a 5% to 10% tip is considered polite to acknowledge the staff who packaged and prepared the order, especially for complex or large orders."
  }
];

type TipResult = {
  tipAmount: number;
  totalWithTip: number;
  tipPerPerson: number;
  totalPerPerson: number;
};

export default function TipCalculator() {
  const [bill, setBill] = useState("");
  const [tipPercent, setTipPercent] = useState(15);
  const [people, setPeople] = useState("1");
  
  const [result, setResult] = useState<TipResult | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    const b = parseFloat(bill);
    const p = parseFloat(people);
    const t = tipPercent;

    if (isNaN(b) || isNaN(p) || b <= 0 || p <= 0) {
      setError("Please enter valid positive numbers for bill and people");
      return;
    }
    
    // Check for realistic number of people
    if (!Number.isInteger(p)) {
         setError("Number of people should be a whole number");
         return;
    }

    const tipAmt = b * (t / 100);
    const total = b + tipAmt;
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate', {
        event_category: 'calculator',
        event_label: 'Tip Calculator',
        value: tipAmt
      });
    }

    setResult({
      tipAmount: tipAmt,
      totalWithTip: total,
      tipPerPerson: tipAmt / p,
      totalPerPerson: total / p
    });
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
            Smart Tip Calculator & Bill Splitter
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Instantly calculate exact gratuity percentages and flawlessly split the final check among your party without mental math or awkward table disputes.
          </p>

          <div className="max-w-xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
              <CardHeader className="flex flex-col gap-2 pb-4 pt-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Enter Bill Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Input your pre-tax bill amount, adjust the slider for your desired tip, and set party size.
                </p>
              </CardHeader>
              <CardContent className="space-y-8 p-6">
                <div className="grid gap-6">
                  <Input
                    type="number"
                    label="Total Bill Amount"
                    placeholder="e.g., 50.00"
                    startContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">$</span></div>}
                    value={bill}
                    onValueChange={setBill}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                      label: "text-gray-700 dark:text-gray-300 font-medium",
                      input: "text-gray-900 dark:text-white font-semibold text-lg",
                    }}
                  />
                  
                   <div className="bg-gray-50 dark:bg-gray-900/50 p-4 border border-gray-200 dark:border-gray-700 rounded">
                        <div className="flex justify-between items-center mb-4">
                             <label className="text-gray-900 dark:text-gray-100 font-semibold">Tip Percentage</label>
                             <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">{tipPercent}%</span>
                        </div>
                        <Slider 
                            aria-label="Tip Percentage"
                            step={1} 
                            maxValue={50} 
                            minValue={0} 
                            value={tipPercent} 
                            onChange={(v) => setTipPercent(v as number)}
                            className="max-w-full"
                            color="primary"
                            size="lg"
                        />
                        <div className="flex justify-between mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
                             <span onClick={() => setTipPercent(10)} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800">10%</span>
                             <span onClick={() => setTipPercent(15)} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800">15%</span>
                             <span onClick={() => setTipPercent(18)} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800">18%</span>
                             <span onClick={() => setTipPercent(20)} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800">20%</span>
                             <span onClick={() => setTipPercent(25)} className="cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-800">25%</span>
                        </div>
                   </div>

                  <Input
                    type="number"
                    label="Number of People (Splitting)"
                    placeholder="e.g., 2"
                    value={people}
                    onValueChange={setPeople}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                      label: "text-gray-700 dark:text-gray-300 font-medium",
                      input: "text-gray-900 dark:text-white font-semibold text-lg",
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
                  className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors border-0"
                >
                  Calculate Final Check
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {result && (
        <div className="container mx-auto px-4 py-12 space-y-12 max-w-5xl">
          <AdPlaceholder position="top" />

          <div id="results" className="max-w-4xl mx-auto">
             <div className="grid md:grid-cols-2 gap-8">
               {/* Total Summary */}
               <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-none shadow-sm flex flex-col justify-center">
                 <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">Party Total</h3>
                 <div className="space-y-6">
                     <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded border border-gray-100 dark:border-gray-800">
                          <span className="text-gray-600 dark:text-gray-300 font-medium">Total Gratuity</span>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                              {result.tipAmount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          </span>
                     </div>
                     <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/20 p-4 rounded border border-blue-100 dark:border-blue-800/30">
                          <span className="text-blue-800 dark:text-blue-300 font-bold">Total Bill (with Tip)</span>
                          <span className="text-3xl font-extrabold text-blue-700 dark:text-blue-400">
                               {result.totalWithTip.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          </span>
                     </div>
                 </div>
               </Card>

               {/* Per Person Summary */}
               <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-none shadow-sm flex flex-col justify-center">
                 <h3 className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase tracking-wider mb-6 border-b border-gray-100 dark:border-gray-700 pb-3">Per Person Breakdown</h3>
                 <div className="space-y-6">
                     <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-900/50 p-4 rounded border border-gray-100 dark:border-gray-800">
                          <span className="text-gray-600 dark:text-gray-300 font-medium">Tip Contribution</span>
                          <span className="text-2xl font-bold text-gray-900 dark:text-white">
                               {result.tipPerPerson.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          </span>
                     </div>
                     <div className="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-4 rounded border border-green-100 dark:border-green-800/30">
                          <span className="text-green-800 dark:text-green-300 font-bold">You Owe Total</span>
                          <span className="text-3xl font-extrabold text-green-700 dark:text-green-400">
                               {result.totalPerPerson.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                          </span>
                     </div>
                 </div>
               </Card>
             </div>
          </div>

          <AdPlaceholder position="bottom" />
        </div>
      )}

      {/* SEO Thick Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-none mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            The Comprehensive Guide to Gratuity: Tipping Math & Dining Etiquette
          </h2>
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Tipping—or gratuity—is a deeply ingrained social custom, particularly in the United States and Canada, where hospitality staff heavily rely on tips to supplement base wages that frequently fall below the standard minimum wage. While determining the correct amount to tip can sometimes feel like an algebra exam at the end of a relaxing dinner, understanding the underlying math and modern etiquette resolves the confusion instantly.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Pre-Tax vs. Post-Tax Tipping: Ending the Debate</h3>
            <p>
              One of the most common questions diners face when the check arrives is whether they should calculate their tip percentage based on the subtotal (pre-tax) or the grand total (post-tax). 
            </p>
            <p>
              According to the Emily Post Institute and widespread service industry consensus, <strong>you should calculate your tip based on the pre-tax bill subtotal.</strong> The logic is straightforward: gratuity is a performance-based reward for the human service provided by the waitstaff. You should not be paying a premium on state or local government sales tax. However, because modern point-of-sale systems (like handheld digital tablets) often calculate suggested percentages on the <em>grand total</em> automatically, many consumers unknowingly tip on the tax. Using our dedicated Tip Calculator ensures you maintain precision control.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Modern Tipping Guidelines by Service Type</h3>
            <p>
              Not all services command the standard 20% benchmark. Here is a generally accepted modern baseline for various hospitality scenarios:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Sit-Down Dining (Standard Service):</strong> 15% to 18%. This was historically the norm and remains entirely acceptable for basic, polite service without major issues.</li>
              <li><strong>Sit-Down Dining (Excellent Service):</strong> 20% to 25%. In post-pandemic culture, 20% has widely become the standard benchmark for any service that is prompt, friendly, and attentive.</li>
              <li><strong>Bartenders:</strong> 15% to 20% of the total tab, or a flat $1 to $2 per drink ordered (e.g., pouring a simple beer vs. crafting a complex 5-ingredient cocktail).</li>
              <li><strong>Takeout & Food Pickup:</strong> 0% is mathematically acceptable as no table service occurred, but 5% to 10% is polite to acknowledge the kitchen staff that organized and packaged the food.</li>
              <li><strong>Food Delivery (UberEats, DoorDash, etc.):</strong> 15% to 20%. Drivers utilize their personal vehicles and gas; treating delivery drivers similarly to sit-down servers is widely encouraged.</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">The "Move the Decimal" Quick Math Strategy</h3>
            <p>
              If you don't have your smartphone handy, rely on the base-10 math trick. Look at your bill's subtotal and move the decimal point one digit to the left. That number equals exactly 10%. To leave a standard 20% tip, simply double that number. For a 15% tip, take the 10% number, cut it in half, and add it back to the original 10%. (E.g., A $40 bill. 10% is $4. 20% is $8. 15% is $4 + $2 = $6).
            </p>
          </div>
        </div>

        <FAQ items={tipFAQs} />
      </article>
    </div>
  );
}
