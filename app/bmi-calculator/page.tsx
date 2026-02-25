"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, Input, Tab, Tabs } from "@nextui-org/react";
import { calculateBMI, BMIResult } from "@/lib/bmiCalculations";
import BMIResultsDisplay from "@/components/BMIResultsDisplay";
import FAQ from "@/components/FAQ";


const bmiFAQs = [
  {
    question: "What is BMI and how is it calculated?",
    answer: "Body Mass Index (BMI) is a simple index of weight-for-height that is commonly used to classify underweight, overweight, and obesity in adults. It is calculated by dividing a person's weight in kilograms by the square of their height in meters (kg/m²)."
  },
  {
    question: "Is BMI an accurate measure of body fat?",
    answer: "BMI is a useful population screening tool but has limitations for individuals. It doesn't distinguish between muscle mass, bone density, and fat mass. For example, highly muscled athletes might be classified as 'overweight' despite having very low body fat. It also doesn't account for age, sex, ethnicity, or how fat is distributed in the body."
  },
  {
    question: "What is a healthy BMI range according to the WHO?",
    answer: "The World Health Organization (WHO) defines the healthy weight range for most adults as a BMI between 18.5 and 24.9. A BMI below 18.5 is considered underweight, between 25.0 and 29.9 is overweight, and 30.0 or higher is considered obese."
  },
  {
    question: "Does age affect what is considered a healthy BMI?",
    answer: "Yes, marginally. While the standard WHO ranges apply to all adults over age 20, some research suggests the 'ideal' BMI shifts slightly upward with age. Older adults may benefit from a slightly higher BMI (25-27) as it may offer protection against bone density loss and provide nutrient reserves during illness. You should always consult a doctor for age-specific advice."
  },
  {
    question: "How often should I calculate my BMI?",
    answer: "Checking your BMI once a month is generally sufficient to track long-term trends. Tracking daily fluctuations in weight is often caused by water retention rather than actual fat loss or gain. Focusing on overall healthy habits like diet, exercise, and sleep is more important than obsessing over the exact BMI decimal."
  }
];

export default function BMICalculator() {
  const [heightUnit, setHeightUnit] = useState<"metric" | "imperial">("metric");
  const [weightUnit, setWeightUnit] = useState<"metric" | "imperial">("metric");
  const [gender, setGender] = useState<"male" | "female" | null>(null);
  
  // Metric State
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");

  // Imperial State
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [weightLbs, setWeightLbs] = useState("");

  const [result, setResult] = useState<BMIResult | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    let heightInCm = 0;
    let weightInKg = 0;

    // Convert height to cm
    if (heightUnit === "metric") {
      if (!heightCm) {
        setError("Please enter height");
        return;
      }
      heightInCm = parseFloat(heightCm);
    } else {
      if (!heightFt || !heightIn) {
        setError("Please enter height (ft & in)");
        return;
      }
      const totalInches = parseFloat(heightFt) * 12 + parseFloat(heightIn);
      heightInCm = totalInches * 2.54; // Convert inches to cm
    }

    // Convert weight to kg
    if (weightUnit === "metric") {
      if (!weightKg) {
        setError("Please enter weight");
        return;
      }
      weightInKg = parseFloat(weightKg);
    } else {
      if (!weightLbs) {
        setError("Please enter weight");
        return;
      }
      weightInKg = parseFloat(weightLbs) * 0.453592; // Convert lbs to kg
    }

    if (isNaN(heightInCm) || isNaN(weightInKg) || heightInCm <= 0 || weightInKg <= 0) {
      setError("Please enter valid positive numbers");
      return;
    }

    // Calculate BMI using metric system
    const bmiResult = calculateBMI(weightInKg, heightInCm, "metric");
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate', {
        event_category: 'calculator',
        event_label: 'BMI Calculator',
        value: bmiResult.bmi
      });
    }

    setResult(bmiResult);
  };

  const reset = () => {
    setResult(null);
    setError("");
  };

  useEffect(() => {
    if (result) {
      const resultsElement = document.getElementById("results");
      if (resultsElement) {
        setTimeout(() => {
          const elementPosition = resultsElement.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 100; // 100px offset for navbar
          
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
      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
            BMI Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Calculate your Body Mass Index (BMI) to understand your health status and find your ideal weight range.
          </p>

          {/* Calculator Card */}
          <div className="max-w-xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
              <CardHeader className="flex flex-col gap-4 pb-4 pt-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center">Select Gender</h2>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => setGender("male")}
                    className={`aspect-square p-4 rounded-md border-2 transition-colors flex flex-col items-center justify-center ${
                      gender === "male"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="text-4xl mb-2">👨</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Male</div>
                  </button>
                  <button
                    onClick={() => setGender("female")}
                    className={`aspect-square p-4 rounded-md border-2 transition-colors flex flex-col items-center justify-center ${
                      gender === "female"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                        : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="text-4xl mb-2">👩</div>
                    <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Female</div>
                  </button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Height Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Height</label>
                    <Tabs 
                      selectedKey={heightUnit} 
                      onSelectionChange={(key) => setHeightUnit(key as "metric" | "imperial")}
                      size="sm"
                      color="primary"
                      variant="bordered"
                      classNames={{
                        tabList: "border-gray-300 dark:border-gray-700",
                        tabContent: "text-gray-700 dark:text-gray-300"
                      }}
                    >
                      <Tab key="metric" title="cm" />
                      <Tab key="imperial" title="ft/in" />
                    </Tabs>
                  </div>
                  {heightUnit === "metric" ? (
                    <Input
                      type="number"
                      placeholder="175"
                      endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">cm</span></div>}
                      value={heightCm}
                      onValueChange={setHeightCm}
                      variant="bordered"
                      classNames={{
                        inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                        input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                      }}
                    />
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="5"
                        endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">ft</span></div>}
                        value={heightFt}
                        onValueChange={setHeightFt}
                        variant="bordered"
                        classNames={{
                          inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                          input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="10"
                        endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">in</span></div>}
                        value={heightIn}
                        onValueChange={setHeightIn}
                        variant="bordered"
                        classNames={{
                          inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                          input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Weight Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Weight</label>
                    <Tabs 
                      selectedKey={weightUnit} 
                      onSelectionChange={(key) => setWeightUnit(key as "metric" | "imperial")}
                      size="sm"
                      color="primary"
                      variant="bordered"
                      classNames={{
                        tabList: "border-gray-300 dark:border-gray-700",
                        tabContent: "text-gray-700 dark:text-gray-300"
                      }}
                    >
                      <Tab key="metric" title="kg" />
                      <Tab key="imperial" title="lbs" />
                    </Tabs>
                  </div>
                  {weightUnit === "metric" ? (
                    <Input
                      type="number"
                      placeholder="70"
                      endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">kg</span></div>}
                      value={weightKg}
                      onValueChange={setWeightKg}
                      variant="bordered"
                      classNames={{
                        inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                        input: "text-gray-900 dark:text-white placeholder:text-gray-400",
                      }}
                    />
                  ) : (
                    <Input
                      type="number"
                      placeholder="160"
                      endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">lbs</span></div>}
                      value={weightLbs}
                      onValueChange={setWeightLbs}
                      variant="bordered"
                      classNames={{
                        inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
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
                  className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors border-0"
                >
                  Calculate BMI
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      
      {result && (
        <div className="container mx-auto px-4 py-12 space-y-12 max-w-5xl">
          <div id="results">
            <BMIResultsDisplay result={result} system="metric" />
          </div>
        </div>
      )}

      {/* SEO Thick Content */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-none mb-12">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            The Complete Guide to Body Mass Index (BMI)
          </h2>
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Body Mass Index (BMI) is a globally recognized metric created in the 19th century by Adolphe Quetelet. It serves as a rapid, non-invasive method for estimating human body fat based on an individual's weight and height. By utilizing the simple mathematical formula (kg/m²), medical professionals and dietitians can quickly screen patients for potential health risks associated with being underweight, overweight, or obese.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Understanding WHO BMI Categories</h3>
            <p>
              The World Health Organization establishes the universal thresholds for adult BMI. These categories are statistically correlated with varying levels of health risk.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li><strong>Underweight (BMI {"<"} 18.5):</strong> Associated with potential malnutrition, osteoporosis, and weakened immunity.</li>
              <li><strong>Normal / Healthy Weight (BMI 18.5 - 24.9):</strong> Statistically associated with the lowest incidence of severe illness and lowest mortality rates.</li>
              <li><strong>Overweight (BMI 25.0 - 29.9):</strong> Indicates excess body weight which may begin to increase the risk of cardiovascular diseases.</li>
              <li><strong>Obesity (BMI ≥ 30.0):</strong> Correlates with significantly elevated risks for type 2 diabetes, high blood pressure, and coronary artery disease. Obese groups are further divided into Classes I, II, and III (severe obesity).</li>
            </ul>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">The Limitations of using BMI</h3>
            <p>
              While our BMI Calculator provides an accurate mathematical result, the metric itself is not an end-all diagnostic tool. The formula only evaluates mass. It cannot differentiate between fat, muscle, and bone density. Athletes, bodybuilders, and individuals with a high muscle-to-fat ratio often register as "overweight" or "obese" due to the heavy density of muscle tissue. Similarly, older adults experiencing muscle atrophy might fall into a "healthy" BMI bracket despite carrying a high percentage of visceral fat.
            </p>
            <p>
              For a comprehensive health assessment, doctors usually recommend pairing a BMI calculation with other metrics, such as waist circumference, body fat percentage calipers, or DEXA scans.
            </p>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">Pediatric vs. Adult BMI</h3>
            <p>
              It is critically important to note that adult BMI scales should not be used on children or teenagers. Pediatric BMI is calculated using the exact same formula, but the result is then plotted on age and sex-specific percentile charts provided by the CDC. Because children's body compositions fluctuate wildly as they grow, only a pediatrician should interpret a child's BMI score.
            </p>
          </div>
        </div>

        <FAQ items={bmiFAQs} />
      </article>
    </div>
  );
}
