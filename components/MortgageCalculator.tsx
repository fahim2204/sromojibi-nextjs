"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, Input } from "@nextui-org/react";
import FAQ from "@/components/FAQ";
import AdPlaceholder from "@/components/AdPlaceholder";

const mortgageFAQs = [
  {
    question: "What is included in this mortgage calculation?",
    answer: "This calculator estimates your monthly principal and interest payments based on the home's purchase price, your down payment, and the loan term. It also requires estimates for annual property taxes and home insurance to give you a highly accurate picture of your total monthly housing obligation (PITI)."
  },
  {
    question: "How does a down payment affect my mortgage?",
    answer: "A larger down payment immediately reduces the principal loan amount. This lowers your monthly payments and decreases the total interest paid over the life of the loan. Furthermore, if your down payment equals 20% or more of the home's purchase price, lenders typically waive the requirement for Private Mortgage Insurance (PMI)."
  },
  {
    question: "What is a typical loan term?",
    answer: "In the United States, the most standard mortgage term is the 30-year fixed-rate loan. A 30-year term provides lower, more manageable monthly payments but results in significantly higher total interest costs. Conversely, a 15-year term features much higher monthly payments but saves tens (or hundreds) of thousands of dollars in compound interest."
  },
  {
    question: "What is Private Mortgage Insurance (PMI)?",
    answer: "If you purchase a home with a down payment of less than 20%, lenders consider you a higher-risk borrower. To protect themselves, they require you to pay a monthly premium for Private Mortgage Insurance. This insurance protects the bank—not you—in the event of a default."
  }
];

type MortgageResult = {
  monthlyPrincipalInterest: number;
  monthlyTax: number;
  monthlyInsurance: number;
  totalMonthly: number;
};

export default function MortgageCalculator() {
  const [homePrice, setHomePrice] = useState("300000");
  const [downPayment, setDownPayment] = useState("60000");
  const [interestRate, setInterestRate] = useState("6.5");
  const [loanTerm, setLoanTerm] = useState("30");
  const [propertyTax, setPropertyTax] = useState("3000"); // Annual
  const [homeInsurance, setHomeInsurance] = useState("1200"); // Annual
  
  const [result, setResult] = useState<MortgageResult | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    
    // Parse inputs
    const price = parseFloat(homePrice);
    const down = parseFloat(downPayment);
    const rate = parseFloat(interestRate);
    const term = parseFloat(loanTerm);
    const tax = parseFloat(propertyTax) || 0;
    const insurance = parseFloat(homeInsurance) || 0;

    // Validate
    if (isNaN(price) || isNaN(down) || isNaN(rate) || isNaN(term) || price <= 0 || term <= 0) {
      setError("Please enter valid positive numbers for core fields");
      return;
    }

    if (down >= price) {
        setError("Down payment cannot equal or exceed home price");
        return;
    }

    const principal = price - down;
    const monthlyRate = rate / 100 / 12;
    const numPayments = term * 12;

    // Principal & Interest
    let monthlyPI = 0;
    if (rate === 0) {
        monthlyPI = principal / numPayments;
    } else {
        const x = Math.pow(1 + monthlyRate, numPayments);
        monthlyPI = (principal * x * monthlyRate) / (x - 1);
    }

    // Monthly Tax & Insurance
    const monthlyT = tax / 12;
    const monthlyI = insurance / 12;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate', {
        event_category: 'calculator',
        event_label: 'Mortgage Calculator',
        value: price
      });
    }

    setResult({
      monthlyPrincipalInterest: monthlyPI,
      monthlyTax: monthlyT,
      monthlyInsurance: monthlyI,
      totalMonthly: monthlyPI + monthlyT + monthlyI
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
            Home Mortgage Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Accurately calculate your total monthly housing obligation (PITI), including exact principal amortization, compounding interest, local property taxes, and homeowners insurance.
          </p>

          <div className="max-w-4xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
              <CardHeader className="flex flex-col gap-2 pb-4 pt-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Mortgage Input Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Provide your home's total price, your down payment cash, and estimated annual taxes to view a complete repayment breakdown.
                </p>
              </CardHeader>
              <CardContent className="space-y-8 p-6">
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: Core Loan Info */}
                    <div className="space-y-6 flex flex-col justify-end">
                        <Input
                            type="number"
                            label="Total Home Purchase Price"
                            startContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">$</span></div>}
                            value={homePrice}
                            onValueChange={setHomePrice}
                            variant="bordered"
                            classNames={{
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-900 dark:text-white",
                            }}
                        />
                        <Input
                            type="number"
                            label="Down Payment (Cash)"
                            startContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">$</span></div>}
                            value={downPayment}
                            onValueChange={setDownPayment}
                            variant="bordered"
                            classNames={{
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-900 dark:text-white",
                            }}
                        />
                        <Input
                            type="number"
                            label="Annual Interest Rate"
                            endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">%</span></div>}
                            value={interestRate}
                            onValueChange={setInterestRate}
                            variant="bordered"
                            classNames={{
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-900 dark:text-white",
                            }}
                        />
                        <Input
                            type="number"
                            label="Loan Term"
                            endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small font-medium">Years</span></div>}
                            value={loanTerm}
                            onValueChange={setLoanTerm}
                            variant="bordered"
                            classNames={{
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-900 dark:text-white",
                            }}
                        />
                    </div>

                    {/* Right Column: Extras (Tax, Insurance) */}
                    <div className="space-y-6 flex flex-col justify-end">
                        <Input
                            type="number"
                            label="Annual Property Tax"
                            startContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">$</span></div>}
                            value={propertyTax}
                            onValueChange={setPropertyTax}
                            variant="bordered"
                            classNames={{
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-900 dark:text-white",
                            }}
                        />
                        <Input
                            type="number"
                            label="Annual Homeowners Insurance"
                            startContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">$</span></div>}
                            value={homeInsurance}
                            onValueChange={setHomeInsurance}
                            variant="bordered"
                            classNames={{
                                inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                                label: "text-gray-700 dark:text-gray-300 font-medium",
                                input: "text-gray-900 dark:text-white",
                            }}
                        />
                        <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded border border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-400">
                            <p className="font-semibold text-gray-900 dark:text-gray-200 mb-1">Important Note on Escrow:</p>
                            <p>Taxes and insurance vary wildly by county and zip code. Lenders divide these annual amounts by 12 and hold them in an escrow account, adding them to your core mortgage bill.</p>
                        </div>
                    </div>
                </div>

                {error && (
                  <div className="text-red-700 dark:text-red-300 text-sm font-medium bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-800 text-center">
                    {error}
                  </div>
                )}

                <Button 
                  onPress={handleCalculate}
                  className="w-full h-14 text-lg font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors border-0 mt-4"
                >
                  Calculate Total Monthly Mortgage
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
             <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-8 rounded-none shadow-sm mb-6">
               <div className="text-center mb-8 pb-8 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Estimated Total Monthly Payment (PITI)</h3>
                  <div className="text-6xl font-extrabold text-gray-900 dark:text-white">
                      {result.totalMonthly.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </div>
               </div>

               <div className="grid md:grid-cols-3 gap-8">
                   <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Principal & Interest</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {result.monthlyPrincipalInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </p>
                   </div>
                   <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Property Tax (Escrow)</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {result.monthlyTax.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </p>
                   </div>
                   <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded border border-gray-100 dark:border-gray-800">
                      <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">Home Insurance (Escrow)</p>
                      <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                          {result.monthlyInsurance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </p>
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
            The Comprehensive Guide to Mortgage Calculation: Understanding PITI
          </h2>
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Purchasing a home is the most significant financial decision most individuals will ever make. However, first-time homebuyers often make a critical mistake: they calculate their budget based solely on the list price of the home and the bank's principal repayment. They fail to understand the components of <strong>PITI</strong> (Principal, Interest, Taxes, and Insurance), which represent the true, holistic cost of homeownership.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">The Four Pillars of Your Mortgage Payment (PITI)</h3>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Principal:</strong> The portion of your payment that directly reduces the core loan balance. In the first few years of a 30-year mortgage, this amount is exceptionally small due to amortization schedules.</li>
              <li><strong>Interest:</strong> The fee the bank charges you for borrowing their capital. Mortgages are front-loaded, meaning the vast majority of your payment in the early years goes straight to the bank's profit margins.</li>
              <li><strong>Taxes:</strong> Local municipalities fund schools, roads, and emergency services via property taxes. Rather than trusting you to save for a massive annual tax bill, lenders legally force you to pay 1/12th of this bill every month into an "Escrow" account. The lender then pays the county on your behalf. Thus, as property taxes rise due to inflation, your fixed mortgage payment will also increase.</li>
              <li><strong>Insurance:</strong> Much like taxes, lenders mandate that you maintain a comprehensive homeowners insurance policy to protect their collateral (the house) against fire, theft, and natural disasters. The annual premium is divided by 12 and collected alongside your principal payment via escrow.</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">The Private Mortgage Insurance (PMI) Trap</h3>
            <p>
              If your initial cash down payment is less than 20% of the home's total purchase price, conventional lenders will require you to pay for Private Mortgage Insurance (PMI). Despite what the name implies, PMI provides you with absolutely zero protection. It is an insurance policy you pay for that exclusively protects the lender if you default and go into foreclosure.
            </p>
            <p>
              PMI can add hundreds of dollars to your monthly mortgage bill and provides no equity return. The only way to remove PMI is to pay down the mortgage until you achieve 20% equity in the property, or naturally ride out property value appreciation until a new appraisal confirms your 20% equity position. By adjusting the down payment field in our calculator to 20%, you can immediately see the financial benefit of avoiding PMI entirely.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Why Amortization Schedules Matter</h3>
            <p>
              Mortgage calculators inherently utilize an amortization formula. It mathematically ensures that while your core PITI payment stays mostly identical for 30 years (barring tax/insurance fluctuations), the ratio of principal-to-interest changes dramatically every single month. By understanding this curve, aggressive savers often choose to make one extra "principal-only" payment per year, a financial hack that can shave up to 5 to 7 years off a standard 30-year mortgage term.
            </p>
          </div>
        </div>

        <FAQ items={mortgageFAQs} />
      </article>
    </div>
  );
}
