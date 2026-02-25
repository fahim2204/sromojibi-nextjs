"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, Input } from "@nextui-org/react";
import FAQ from "@/components/FAQ";
import AdPlaceholder from "@/components/AdPlaceholder";

const loanFAQs = [
  {
    question: "How is the monthly payment calculated?",
    answer: "The monthly payment is calculated using the standard amortization formula: M = P [i(1 + i)^n] / [(1 + i)^n – 1], where P is the principal loan amount, i is the monthly interest rate (annual rate divided by 12), and n is the total number of months."
  },
  {
    question: "What is an amortization schedule?",
    answer: "An amortization schedule is a complete table of periodic loan payments, showing the amount of principal and the amount of interest that comprise each payment until the loan is paid off at the end of its term. Early payments mostly cover interest, while later payments mostly cover principal."
  },
  {
    question: "Does this calculator include extra fees like taxes or insurance?",
    answer: "No, this basic repayment calculator only accounts for the raw principal and the interest amortized over the specified term. It does not include Private Mortgage Insurance (PMI), origination fees, property taxes, or homeowners insurance that typically accompany actual mortgages."
  },
  {
    question: "What happens if I change the loan term?",
    answer: "Increasing the loan term (e.g., from 15 to 30 years) generally lowers your required monthly payment, making the loan more cash-flow affordable month-to-month. However, it severely increases the total massive amount of compound interest you will pay over the life of the entire loan."
  }
];

type LoanResult = {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
};

export default function LoanCalculator() {
  const [amount, setAmount] = useState("");
  const [interest, setInterest] = useState("");
  const [years, setYears] = useState("");
  
  const [result, setResult] = useState<LoanResult | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    
    if (!amount || !interest || !years) {
      setError("Please fill in all fields");
      return;
    }

    const p = parseFloat(amount); // Principal
    const r = parseFloat(interest) / 100 / 12; // Monthly interest rate
    const n = parseFloat(years) * 12; // Total number of payments

    if (isNaN(p) || isNaN(r) || isNaN(n) || p <= 0 || r <= 0 || n <= 0) {
       // Handle simple interest (rate 0) case or invalid inputs
       if (parseFloat(interest) === 0 && p > 0 && n > 0) {
            setResult({
                monthlyPayment: p / n,
                totalPayment: p,
                totalInterest: 0
            });
            return;
       }
       setError("Please enter valid positive numbers");
       return;
    }

    // Formula: M = P [i(1 + i)^n] / [(1 + i)^n – 1]
    const x = Math.pow(1 + r, n);
    const monthly = (p * x * r) / (x - 1);
    
    if (isNaN(monthly) || !isFinite(monthly)) {
        setError("Calculation error. Please check inputs.");
        return;
    }

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate', {
        event_category: 'calculator',
        event_label: 'Loan Calculator',
        value: p
      });
    }

    setResult({
      monthlyPayment: monthly,
      totalPayment: monthly * n,
      totalInterest: (monthly * n) - p
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
            Loan Amortization Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Accurately project your fixed monthly minimum payments and calculate the total compound interest over the complete life of your personal, auto, or mortgage loan.
          </p>

          <div className="max-w-xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
              <CardHeader className="flex flex-col gap-2 pb-4 pt-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Enter Loan Details</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Input principal, annual rate, and total years below.
                </p>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="grid gap-6">
                  <Input
                    type="number"
                    label="Principal Loan Amount"
                    placeholder="E.g., 25000"
                    startContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">$</span></div>}
                    value={amount}
                    onValueChange={setAmount}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                      label: "text-gray-700 dark:text-gray-300 font-medium",
                      input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                    }}
                  />
                  <Input
                    type="number"
                    label="Annual Interest Rate"
                    placeholder="E.g., 5.5"
                    endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">%</span></div>}
                    value={interest}
                    onValueChange={setInterest}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                      label: "text-gray-700 dark:text-gray-300 font-medium",
                      input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                    }}
                  />
                  <Input
                    type="number"
                    label="Loan Term"
                    placeholder="E.g., 5"
                    endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small font-medium">Years</span></div>}
                    value={years}
                    onValueChange={setYears}
                    variant="bordered"
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
                  Calculate Repayment Plan
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
             <div className="grid md:grid-cols-3 gap-6">
               <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-center rounded-none shadow-sm">
                 <h3 className="text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide text-sm">Monthly Payment</h3>
                 <div className="text-3xl font-extrabold text-blue-600 dark:text-blue-400">
                    {result.monthlyPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                 </div>
               </Card>
               <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-center rounded-none shadow-sm">
                 <h3 className="text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide text-sm">Total Interest Paid</h3>
                 <div className="text-3xl font-extrabold text-red-600 dark:text-red-400">
                    {result.totalInterest.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                 </div>
               </Card>
               <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6 text-center rounded-none shadow-sm">
                 <h3 className="text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wide text-sm">Total Cost of Loan</h3>
                 <div className="text-3xl font-extrabold text-gray-900 dark:text-white">
                    {result.totalPayment.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
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
            The Complete Guide to Loan Amortization and Compound Interest
          </h2>
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Applying for a massive loan—whether it's a 30-year fixed-rate mortgage, a 5-year auto lease, or a personal debt consolidation—requires a deep mathematical understanding of how banks structurally calculate interest. A simple loan calculator is the most vital tool for preventing yourself from over-borrowing and ending up "underwater" on a depreciating asset.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">How Banks Amortize Loans</h3>
            <p>
              When a retail bank lends you $100,000 at a 5% interest rate over 30 years, they do not simply add 5% to the total and divide by the months. Instead, they use an <strong>amortization schedule</strong>. This mathematical formula ensures your monthly payment remains exactly the same for 360 months, but the ratio of <em>what</em> that payment covers drastically shifts over time.
            </p>
            <p>
               In the first five years of a 30-year mortgage, roughly 70% to 80% of your minimum monthly payment goes directly toward paying the bank's interest. Only a tiny fraction reduces your actual debt (the principal). It is only in the final decade of the loan that your payments heavily transition to finally paying down your core principal balance. Understanding this heavily front-loaded curve is essential if you plan to aggressively pay off debt early.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">The True Cost of Extended Terms</h3>
            <p>
              Automobile dealerships frequently try to successfully negotiate based on the "monthly payment" rather than the total sticker price. They achieve lower monthly payments by illegally or legally stretching the loan term from a standard 48 or 60 months out to 72 or even 84 months. 
            </p>
            <p>
              While stretching the term provides immediate monthly cash-flow relief, it guarantees thousands of dollars in extra compound interest paid to the lender. Our loan calculator rapidly reveals this "hidden cost" by exposing the <strong>Total Interest</strong> field, proving exactly how much extra cash you give the bank just for the privilege of a longer runway. Always attempt to secure the shortest realistic term you can safely cash-flow.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Extra Costs to Consider</h3>
            <p>
              Keep in mind that raw amortization is only the baseline. If you are calculating a home purchase, your total required monthly cash output will be significantly higher than the calculator's result. Lenders will hold additional money in escrow to cover unavoidable property taxes, mandatory homeowners insurance, and if you have less than a 20% down payment, extremely expensive Private Mortgage Insurance (PMI).
            </p>
          </div>
        </div>

        <FAQ items={loanFAQs} />
      </article>
    </div>
  );
}
