"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, DatePicker } from "@nextui-org/react";
import { getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { calculateAge, calculateNextBirthday, calculateLifeInsights, AgeResult, NextBirthday, LifeInsights as LifeInsightsType } from "@/lib/ageCalculations";
import { getFamousBirthdays, FamousPerson } from "@/data/famousBirthdays";
import ResultsDisplay from "@/components/ResultsDisplay";
import LifeInsights from "@/components/LifeInsights";
import FamousBirthdays from "@/components/FamousBirthdays";
import FAQ from "@/components/FAQ";

export default function AgeCalculator() {
  const [date, setDate] = useState<CalendarDate | null>(null);
  const [isCalculated, setIsCalculated] = useState(false);
  const [ageResult, setAgeResult] = useState<AgeResult | null>(null);
  const [nextBirthday, setNextBirthday] = useState<NextBirthday | null>(null);
  const [lifeInsights, setLifeInsights] = useState<LifeInsightsType | null>(null);
  const [famousPeople, setFamousPeople] = useState<FamousPerson[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isCalculated) {
      const resultsElement = document.getElementById('results');
      if (resultsElement) {
        resultsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [isCalculated]);

  const handleCalculate = () => {
    setError("");
    
    if (!date) {
      setError("Please enter a date");
      return;
    }

    const nativeDate = date.toDate(getLocalTimeZone());
    const todayDate = new Date();

    if (nativeDate > todayDate) {
      setError("Date must be in the past");
      return;
    }

    // Calculate
    const result = calculateAge(nativeDate);
    const nextBday = calculateNextBirthday(nativeDate);
    const insights = calculateLifeInsights(result.totalDays);
    const famous = getFamousBirthdays(nativeDate.getMonth(), nativeDate.getDate());

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate', {
        event_category: 'calculator',
        event_label: 'Age Calculator'
      });
    }

    setAgeResult(result);
    setNextBirthday(nextBday);
    setLifeInsights(insights);
    setFamousPeople(famous);
    setIsCalculated(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 pb-20">
      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
            Age Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Calculate your precise age in years, months, and days. Explore life insights and discover which historical figures share your birthday.
          </p>

          {/* Calculator Card */}
          <div className="max-w-xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
              <CardHeader className="flex flex-col gap-1 pb-4 pt-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Enter Date of Birth</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select your birth date below to get your full age breakdown.
                </p>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="flex flex-col space-y-2">
                  <DatePicker 
                    label="Date of Birth"
                    variant="bordered"
                    showMonthAndYearPickers
                    value={date} 
                    onChange={setDate}
                    maxValue={today(getLocalTimeZone())}
                    description="Format: MM/DD/YYYY"
                    className="max-w-full"
                    classNames={{
                      inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                      label: "text-gray-700 dark:text-gray-300 font-medium",
                      description: "text-gray-500 dark:text-gray-400",
                    }}
                  />
                </div>

                {error && (
                  <div className="text-red-700 dark:text-red-300 text-sm font-medium bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-800">
                    {error}
                  </div>
                )}

                <Button 
                  onPress={handleCalculate}
                  className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors border-0"
                >
                  Calculate Age
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {isCalculated && ageResult && nextBirthday && lifeInsights && (
        <div className="container mx-auto px-4 py-12 space-y-12 max-w-5xl">
          <div id="results">
            <ResultsDisplay ageResult={ageResult} nextBirthday={nextBirthday} />
          </div>

          <LifeInsights insights={lifeInsights} />
          
          <FamousBirthdays people={famousPeople} />
        </div>
      )}

      {/* SEO Thick Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-none mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            Understanding Age Calculation & Chronological Age
          </h2>
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Calculating your exact age requires more than simply subtracting your birth year from the current year. To determine a precise "chronological age," one must account for the varied number of days in different months, as well as the occurrence of leap years. Our age calculator uses advanced date mathematical algorithms to compute your exact age in years, months, weeks, and days.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Why is Exact Age Important?</h3>
            <p>
              Knowing your precise chronological age is useful across various administrative and medical fields. For example, pediatric dosing and childhood development milestones are often measured in specific months and weeks, rather than just years. Furthermore, many legal rights (such as driving licenses, voting rights, and retirement benefits) are anchored to a very specific date.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">How Do Leap Years Affect My Age?</h3>
            <p>
              A leap year occurs every four years, adding an extra day (February 29th) to the calendar to keep our calendar year synchronized with the astronomical year. If you were born on a leap day (a "leapling"), age calculation conventions differ by region. Usually, leaplings celebrate their birthdays on February 28th or March 1st in non-leap years. Our calculator seamlessly handles leap seconds, leap days, and standard planetary calendar shifts to provide down-to-the-minute accuracy.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Life Insights and Fun Facts</h3>
            <p>
              Beyond just knowing how old you are, it's fascinating to put time into perspective. Converting your age into total days or total seconds emphasizes the sheer scale of a human lifespan. Additionally, our tool provides fun "life insights" simulating average biological impacts—like how many breaths you've taken or heartbeats you've experienced—based on standard medical baselines of 60-100 heartbeats per minute and 12-20 breaths per minute. 
            </p>
          </div>
        </div>

        <FAQ 
          items={[
            {
              question: "How accurate is this chronological age calculator?",
              answer: "Our chronological age calculator evaluates the full scope of your birth date. It calculates your exact age down to the day by utilizing strict native JavaScript date object rules. This guarantees absolute precision, accounting automatically for leap years, varying month lengths (28, 30, or 31 days), and timezones."
            },
            {
              question: "How are the biological life insights calculated?",
              answer: "Life insights are generated using established adult baseline averages. For example, we calculate breaths taken assuming an average resting rate of 16 breaths per minute. Averages for water consumption and heartbeats operate similarly. It is important to note these are statistical estimations for entertainment and visualization purposes, and actual biological metrics depend on health, fitness level, and genetics."
            },
            {
              question: "What is the next birthday countdown feature?",
              answer: "The next birthday countdown uses your month and day of birth, combined with the current chronological year, to calculate the delta (difference) between today and your upcoming birthday. It displays the remaining days, hours, and minutes until you celebrate."
            },
            {
              question: "How does the tool calculate my age in months or weeks?",
              answer: "To get total months, the calculator multiplies your full years by twelve, then adds the remaining calendar months since your last birthday. To get your exact age in weeks, it takes your absolute total days alive and simply divides by seven."
            }
          ]}
        />
      </article>
    </div>
  );
}
