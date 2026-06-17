"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, Input, Tab, Tabs, Select, SelectItem } from "@nextui-org/react";
import { Flame, RotateCcw, AlertTriangle, ShieldCheck, Activity } from "lucide-react";
import FAQ from "@/components/FAQ";
import AdPlaceholder from "@/components/AdPlaceholder";
import {
  calculateCalorieNeeds,
  CalorieCalculationResult,
  ActivityLevel,
  Formula,
  Gender
} from "@/lib/calorieCalculations";

const calorieFAQs = [
  {
    question: "What is BMR (Basal Metabolic Rate)?",
    answer: "Basal Metabolic Rate (BMR) represents the minimum number of calories your body needs to maintain basic life-sustaining functions at rest, such as breathing, blood circulation, cell production, and body temperature regulation. It does not account for any physical movement or digestion."
  },
  {
    question: "What is TDEE (Total Daily Energy Expenditure)?",
    answer: "Total Daily Energy Expenditure (TDEE) is the total number of calories your body burns in a 24-hour period. It is calculated by multiplying your Basal Metabolic Rate (BMR) by an activity multiplier that corresponds to your exercise level and daily activity habits."
  },
  {
    question: "Which formula is better: Mifflin-St Jeor or Harris-Benedict?",
    answer: "The Mifflin-St Jeor equation is considered the current standard and is generally more accurate for modern populations. The Harris-Benedict equation is an older method (revised in 1984) which can sometimes overestimate caloric needs, particularly in individuals with higher body fat percentages."
  },
  {
    question: "What is a safe minimum daily calorie intake?",
    answer: "As a general medical guideline, women should not consume fewer than 1,200 calories per day, and men should not consume fewer than 1,500 calories per day, unless supervised by a physician. Consuming fewer calories can lead to nutrient deficiencies, muscle loss, severe fatigue, and a slowed metabolic rate."
  },
  {
    question: "How are the macronutrient split goals calculated?",
    answer: "The macronutrient guidelines are calculated using a balanced daily split: 40% Carbohydrates, 30% Protein, and 30% Fats. Carbs and protein contain 4 calories per gram, while fats contain 9 calories per gram. You can adjust these ratios based on your specific fitness targets (e.g., higher protein for bodybuilding)."
  }
];

export default function CalorieCalculator() {
  const [gender, setGender] = useState<Gender>("male");
  const [age, setAge] = useState("25");
  
  const [heightUnit, setHeightUnit] = useState<"metric" | "imperial">("metric");
  const [weightUnit, setWeightUnit] = useState<"metric" | "imperial">("metric");

  // Inputs
  const [heightCm, setHeightCm] = useState("180");
  const [heightFt, setHeightFt] = useState("5");
  const [heightIn, setHeightIn] = useState("10");

  const [weightKg, setWeightKg] = useState("80");
  const [weightLbs, setWeightLbs] = useState("176");

  const [activityLevel, setActivityLevel] = useState<ActivityLevel>("sedentary");
  const [formula, setFormula] = useState<Formula>("mifflin");

  // Calculations Results
  const [result, setResult] = useState<CalorieCalculationResult | null>(null);
  const [error, setError] = useState("");

  const handleCalculate = () => {
    setError("");
    setResult(null);

    const parsedAge = parseInt(age);
    if (isNaN(parsedAge) || parsedAge <= 0 || parsedAge > 120) {
      setError("Please enter a valid age between 1 and 120.");
      return;
    }

    let calculatedHeightCm = 0;
    if (heightUnit === "metric") {
      calculatedHeightCm = parseFloat(heightCm);
      if (isNaN(calculatedHeightCm) || calculatedHeightCm < 50 || calculatedHeightCm > 270) {
        setError("Please enter a valid height between 50 cm and 270 cm.");
        return;
      }
    } else {
      const ft = parseFloat(heightFt);
      const inch = parseFloat(heightIn);
      if (isNaN(ft) || ft < 1 || ft > 8 || isNaN(inch) || inch < 0 || inch >= 12) {
        setError("Please enter a valid height in feet and inches (e.g. 5 ft 10 in).");
        return;
      }
      calculatedHeightCm = (ft * 12 + inch) * 2.54;
    }

    let calculatedWeightKg = 0;
    if (weightUnit === "metric") {
      calculatedWeightKg = parseFloat(weightKg);
      if (isNaN(calculatedWeightKg) || calculatedWeightKg < 10 || calculatedWeightKg > 500) {
        setError("Please enter a valid weight between 10 kg and 500 kg.");
        return;
      }
    } else {
      const lbs = parseFloat(weightLbs);
      if (isNaN(lbs) || lbs < 20 || lbs > 1000) {
        setError("Please enter a valid weight between 20 lbs and 1000 lbs.");
        return;
      }
      calculatedWeightKg = lbs * 0.45359237;
    }

    const calcResult = calculateCalorieNeeds({
      gender,
      age: parsedAge,
      height: calculatedHeightCm,
      weight: calculatedWeightKg,
      activityLevel,
      formula,
    });

    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "calculate", {
        event_category: "calculator",
        event_label: "Calorie Calculator",
        value: calcResult.tdee,
      });
    }

    setResult(calcResult);
  };

  const handleReset = () => {
    setGender("male");
    setAge("25");
    setHeightUnit("metric");
    setWeightUnit("metric");
    setHeightCm("180");
    setHeightFt("5");
    setHeightIn("10");
    setWeightKg("80");
    setWeightLbs("176");
    setActivityLevel("sedentary");
    setFormula("mifflin");
    setResult(null);
    setError("");
  };

  // Scroll to results when calculated
  useEffect(() => {
    if (result !== null) {
      const element = document.getElementById("results");
      if (element) {
        setTimeout(() => {
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 100;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
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
            Calorie Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Calculate your Basal Metabolic Rate (BMR) and Total Daily Energy Expenditure (TDEE). Find daily caloric intake targets for weight loss, gain, or maintenance.
          </p>

          <div className="max-w-xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
              <CardHeader className="flex flex-col gap-4 pb-4 pt-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 text-center w-full">Select Gender</h2>
                <div className="grid grid-cols-2 gap-4 w-full">
                  <button
                    onClick={() => setGender("male")}
                    className={`p-4 rounded-md border-2 transition-colors flex flex-col items-center justify-center ${
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
                    className={`p-4 rounded-md border-2 transition-colors flex flex-col items-center justify-center ${
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
                
                {/* Age Input */}
                <Input
                  type="number"
                  label="Age"
                  labelPlacement="outside"
                  placeholder="e.g. 25"
                  value={age}
                  onValueChange={setAge}
                  variant="bordered"
                  endContent={<span className="text-gray-500 text-xs">years</span>}
                  classNames={{
                    inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900",
                    label: "text-gray-700 dark:text-gray-300 font-medium",
                    input: "text-gray-900 dark:text-white font-semibold text-lg"
                  }}
                />

                {/* Height Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
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
                      <Tab key="metric" title="Metric (cm)" />
                      <Tab key="imperial" title="Imperial (ft/in)" />
                    </Tabs>
                  </div>
                  {heightUnit === "metric" ? (
                    <Input
                      type="number"
                      placeholder="180"
                      value={heightCm}
                      onValueChange={setHeightCm}
                      variant="bordered"
                      endContent={<span className="text-gray-500 text-xs">cm</span>}
                      classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                    />
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="5"
                        value={heightFt}
                        onValueChange={setHeightFt}
                        variant="bordered"
                        endContent={<span className="text-gray-500 text-xs">ft</span>}
                        classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                      />
                      <Input
                        type="number"
                        placeholder="10"
                        value={heightIn}
                        onValueChange={setHeightIn}
                        variant="bordered"
                        endContent={<span className="text-gray-500 text-xs">in</span>}
                        classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                      />
                    </div>
                  )}
                </div>

                {/* Weight Input */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
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
                      <Tab key="metric" title="Metric (kg)" />
                      <Tab key="imperial" title="Imperial (lbs)" />
                    </Tabs>
                  </div>
                  {weightUnit === "metric" ? (
                    <Input
                      type="number"
                      placeholder="80"
                      value={weightKg}
                      onValueChange={setWeightKg}
                      variant="bordered"
                      endContent={<span className="text-gray-500 text-xs">kg</span>}
                      classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                    />
                  ) : (
                    <Input
                      type="number"
                      placeholder="176"
                      value={weightLbs}
                      onValueChange={setWeightLbs}
                      variant="bordered"
                      endContent={<span className="text-gray-500 text-xs">lbs</span>}
                      classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                    />
                  )}
                </div>

                {/* Activity Level Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Daily Activity Level</label>
                  <Select
                    selectedKeys={[activityLevel]}
                    onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                    variant="bordered"
                    classNames={{
                      trigger: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900",
                      value: "text-gray-900 dark:text-white",
                      popoverContent: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                    }}
                  >
                    <SelectItem key="sedentary" value="sedentary" className="text-gray-900 dark:text-gray-100">
                      Sedentary (desk job, little to no exercise)
                    </SelectItem>
                    <SelectItem key="light" value="light" className="text-gray-900 dark:text-gray-100">
                      Lightly Active (light exercise 1-3 days/week)
                    </SelectItem>
                    <SelectItem key="moderate" value="moderate" className="text-gray-900 dark:text-gray-100">
                      Moderately Active (moderate exercise 3-5 days/week)
                    </SelectItem>
                    <SelectItem key="active" value="active" className="text-gray-900 dark:text-gray-100">
                      Very Active (hard training 6-7 days/week)
                    </SelectItem>
                    <SelectItem key="extra" value="extra" className="text-gray-900 dark:text-gray-100">
                      Extra Active (physical job or double workouts)
                    </SelectItem>
                  </Select>
                </div>

                {/* Formula Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">BMR Formula</label>
                  <Select
                    selectedKeys={[formula]}
                    onChange={(e) => setFormula(e.target.value as Formula)}
                    variant="bordered"
                    classNames={{
                      trigger: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900",
                      value: "text-gray-900 dark:text-white",
                      popoverContent: "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700",
                    }}
                  >
                    <SelectItem key="mifflin" value="mifflin" className="text-gray-900 dark:text-gray-100">
                      Mifflin-St Jeor (Recommended default)
                    </SelectItem>
                    <SelectItem key="harris" value="harris" className="text-gray-900 dark:text-gray-100">
                      Revised Harris-Benedict
                    </SelectItem>
                  </Select>
                </div>

                {error && (
                  <div className="text-red-700 dark:text-red-300 text-sm font-medium bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-800 text-center">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onPress={handleReset}
                    variant="bordered"
                    className="flex-1 h-12 text-sm font-bold border-2 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                    startContent={<RotateCcw className="h-4 w-4" />}
                  >
                    Reset
                  </Button>
                  <Button
                    onPress={handleCalculate}
                    color="primary"
                    className="flex-[2] h-12 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors border-0"
                    startContent={<Flame className="h-5 w-5" />}
                  >
                    Calculate Calories
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {result && (
        <div id="results" className="container mx-auto px-4 py-12 max-w-5xl space-y-12">
          <AdPlaceholder position="top" />

          {/* Overview BMR & TDEE cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card className="glass border border-white/10 bg-transparent p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="h-5 w-5 text-purple-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Basal Metabolic Rate (BMR)</h3>
              </div>
              <div className="text-4xl md:text-5xl font-black text-white tabular-nums my-2">
                {result.bmr.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">Calories burned daily at complete rest</p>
            </Card>

            <Card className="glass border border-purple-500/30 bg-transparent p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-pink-400" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Daily Energy Expenditure (TDEE)</h3>
              </div>
              <div className="text-4xl md:text-5xl font-black text-pink-400 tabular-nums my-2">
                {result.tdee.toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">Calories burned daily including physical activity</p>
            </Card>
          </div>

          {/* Detailed Calorie & Macronutrient Profiles for Goals */}
          <div className="max-w-4xl mx-auto space-y-6">
            <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
              Daily Calorie & Macronutrient Recommendations
            </h3>

            <div className="grid grid-cols-1 gap-4">
              
              {/* Maintain Weight */}
              <Card className="glass border-l-4 border-l-blue-500 bg-transparent p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-extrabold text-white text-base">Weight Maintenance</h4>
                    <p className="text-xs text-gray-400">Keep current weight. Zero energy deficit.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-blue-400 tabular-nums">{result.goals.maintain.calories.toLocaleString()} kcal/day</span>
                    <span className="text-[10px] text-gray-400">0 lbs / 0 kgs per week</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs bg-gray-900/30 border border-white/5 p-2 rounded">
                  <div><strong className="text-purple-400">{result.goals.maintain.proteinGrams}g</strong><div className="text-[10px] text-gray-500">Protein (30%)</div></div>
                  <div><strong className="text-amber-500">{result.goals.maintain.carbGrams}g</strong><div className="text-[10px] text-gray-500">Carbs (40%)</div></div>
                  <div><strong className="text-pink-400">{result.goals.maintain.fatGrams}g</strong><div className="text-[10px] text-gray-500">Fats (30%)</div></div>
                </div>
              </Card>

              {/* Mild Loss */}
              <Card className="glass border-l-4 border-l-green-500 bg-transparent p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-extrabold text-white text-base">Mild Weight Loss</h4>
                    <p className="text-xs text-gray-400">Slight caloric deficit. Highly sustainable weight loss.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-green-400 tabular-nums">{result.goals.mildLoss.calories.toLocaleString()} kcal/day</span>
                    <span className="text-[10px] text-gray-400">
                      {weightUnit === "imperial" ? "Lose 0.5 lbs" : "Lose 0.25 kg"}/week
                    </span>
                  </div>
                </div>
                {result.goals.mildLoss.warning && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded mt-3">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{result.goals.mildLoss.warning}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs bg-gray-900/30 border border-white/5 p-2 rounded">
                  <div><strong className="text-purple-400">{result.goals.mildLoss.proteinGrams}g</strong><div className="text-[10px] text-gray-500">Protein (30%)</div></div>
                  <div><strong className="text-amber-500">{result.goals.mildLoss.carbGrams}g</strong><div className="text-[10px] text-gray-500">Carbs (40%)</div></div>
                  <div><strong className="text-pink-400">{result.goals.mildLoss.fatGrams}g</strong><div className="text-[10px] text-gray-500">Fats (30%)</div></div>
                </div>
              </Card>

              {/* Weight Loss */}
              <Card className="glass border-l-4 border-l-emerald-500 bg-transparent p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-extrabold text-white text-base">Weight Loss</h4>
                    <p className="text-xs text-gray-400">Standard deficit. Recommended for steady, healthy fat loss.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-emerald-400 tabular-nums">{result.goals.loss.calories.toLocaleString()} kcal/day</span>
                    <span className="text-[10px] text-gray-400">
                      {weightUnit === "imperial" ? "Lose 1 lb" : "Lose 0.5 kg"}/week
                    </span>
                  </div>
                </div>
                {result.goals.loss.warning && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded mt-3">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{result.goals.loss.warning}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs bg-gray-900/30 border border-white/5 p-2 rounded">
                  <div><strong className="text-purple-400">{result.goals.loss.proteinGrams}g</strong><div className="text-[10px] text-gray-500">Protein (30%)</div></div>
                  <div><strong className="text-amber-500">{result.goals.loss.carbGrams}g</strong><div className="text-[10px] text-gray-500">Carbs (40%)</div></div>
                  <div><strong className="text-pink-400">{result.goals.loss.fatGrams}g</strong><div className="text-[10px] text-gray-500">Fats (30%)</div></div>
                </div>
              </Card>

              {/* Extreme Loss */}
              <Card className="glass border-l-4 border-l-amber-500 bg-transparent p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-white text-base">Extreme Weight Loss</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 border border-amber-500/30 text-amber-400 font-bold uppercase">Aggressive</span>
                    </div>
                    <p className="text-xs text-gray-400">High caloric deficit. Harder to sustain over long periods.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-amber-400 tabular-nums">{result.goals.extremeLoss.calories.toLocaleString()} kcal/day</span>
                    <span className="text-[10px] text-gray-400">
                      {weightUnit === "imperial" ? "Lose 2 lbs" : "Lose 0.9 kg"}/week
                    </span>
                  </div>
                </div>
                {result.goals.extremeLoss.warning && (
                  <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 p-2 rounded mt-3">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{result.goals.extremeLoss.warning}</span>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs bg-gray-900/30 border border-white/5 p-2 rounded">
                  <div><strong className="text-purple-400">{result.goals.extremeLoss.proteinGrams}g</strong><div className="text-[10px] text-gray-500">Protein (30%)</div></div>
                  <div><strong className="text-amber-500">{result.goals.extremeLoss.carbGrams}g</strong><div className="text-[10px] text-gray-500">Carbs (40%)</div></div>
                  <div><strong className="text-pink-400">{result.goals.extremeLoss.fatGrams}g</strong><div className="text-[10px] text-gray-500">Fats (30%)</div></div>
                </div>
              </Card>

              {/* Mild Gain */}
              <Card className="glass border-l-4 border-l-pink-500 bg-transparent p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-extrabold text-white text-base">Mild Weight Gain</h4>
                    <p className="text-xs text-gray-400">Slight caloric surplus. Recommended for clean muscle building.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-pink-400 tabular-nums">{result.goals.mildGain.calories.toLocaleString()} kcal/day</span>
                    <span className="text-[10px] text-gray-400">
                      {weightUnit === "imperial" ? "Gain 0.5 lbs" : "Gain 0.25 kg"}/week
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs bg-gray-900/30 border border-white/5 p-2 rounded">
                  <div><strong className="text-purple-400">{result.goals.mildGain.proteinGrams}g</strong><div className="text-[10px] text-gray-500">Protein (30%)</div></div>
                  <div><strong className="text-amber-500">{result.goals.mildGain.carbGrams}g</strong><div className="text-[10px] text-gray-500">Carbs (40%)</div></div>
                  <div><strong className="text-pink-400">{result.goals.mildGain.fatGrams}g</strong><div className="text-[10px] text-gray-500">Fats (30%)</div></div>
                </div>
              </Card>

              {/* Weight Gain */}
              <Card className="glass border-l-4 border-l-purple-500 bg-transparent p-5">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-extrabold text-white text-base">Weight Gain</h4>
                    <p className="text-xs text-gray-400">Standard caloric surplus. Supports muscle hypertrophy and mass gain.</p>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-black text-purple-400 tabular-nums">{result.goals.gain.calories.toLocaleString()} kcal/day</span>
                    <span className="text-[10px] text-gray-400">
                      {weightUnit === "imperial" ? "Gain 1 lb" : "Gain 0.5 kg"}/week
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 text-center text-xs bg-gray-900/30 border border-white/5 p-2 rounded">
                  <div><strong className="text-purple-400">{result.goals.gain.proteinGrams}g</strong><div className="text-[10px] text-gray-500">Protein (30%)</div></div>
                  <div><strong className="text-amber-500">{result.goals.gain.carbGrams}g</strong><div className="text-[10px] text-gray-500">Carbs (40%)</div></div>
                  <div><strong className="text-pink-400">{result.goals.gain.fatGrams}g</strong><div className="text-[10px] text-gray-500">Fats (30%)</div></div>
                </div>
              </Card>

            </div>
          </div>

          <AdPlaceholder position="bottom" />
        </div>
      )}

      {/* SEO copy text */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-none mb-12 space-y-6 animate-fade-in">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2 flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-blue-500" />
            The Comprehensive Guide to Caloric Balance
          </h2>

          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Weight management centers on the fundamental law of thermodynamics: **Energy Balance**. Calories are the unit of measure for the energy stored in the food you consume and burned during biological function and movement. Understanding your specific daily expenditure values is the crucial foundation for achieving weight loss, weight gain, or weight maintenance.
            </p>
            
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
              Basal Metabolic Rate (BMR) vs. Total Daily Energy Expenditure (TDEE)
            </h3>
            <p>
              Many confuse BMR and TDEE. **BMR** represents the absolute minimal fuel required by your organs to keep you alive in a resting, post-absorptive state (e.g. if you stayed in bed all day). **TDEE** accounts for all factors, including:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li>**Basal Metabolic Rate (BMR)**: Accounts for approximately 60-70% of daily calorie burn.</li>
              <li>**Non-Exercise Activity Thermogenesis (NEAT)**: Fidgeting, walking to your car, standing.</li>
              <li>**Thermic Effect of Food (TEF)**: The energy used to digest nutrients (e.g., protein has a high thermic effect).</li>
              <li>**Exercise Activity Thermogenesis (EAT)**: Deliberate workouts, running, or weight training.</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
              How the Mathematical Formulas Estimate Energy Needs
            </h3>
            <p>
              Because measuring BMR directly requires laboratory metabolic chambers, researchers developed equations based on statistical models. The two most popular equations are:
            </p>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Mifflin-St Jeor Equation:</strong> Developed in 1990, it is currently the standard equation recommended by the Academy of Nutrition and Dietetics. It has proven to be the most accurate at predicting BMR within 10% of measured values for modern populations.
              </li>
              <li>
                <strong>Revised Harris-Benedict Equation:</strong> First introduced in 1919 and updated in 1984. It uses parameters based on height, weight, age, and biological sex, but can slightly overestimate values in obese populations or underestimate them in lean athletes.
              </li>
            </ol>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mt-6">
              Safe Caloric Deficits and Rate of Weight Loss
            </h3>
            <p>
              A standard rule is that 1 pound of body fat contains approximately 3,500 calories. Consequently, reducing your daily calorie intake by 500 calories below your TDEE creates a weekly deficit of 3,500 calories, leading to approximately 1 pound of weight loss per week.
            </p>
            <p>
              However, safe weight loss should not be rushed. Dropping your calorie levels too low triggers physiological defense mechanisms, leading to muscle wasting, hormone disruption, and extreme fatigue. This calculator applies safety warning flags whenever a deficit level yields an output below **1,200 calories/day for women** or **1,500 calories/day for men**. Always focus on slow, sustainable weight management plans.
            </p>
          </div>
        </div>

        <FAQ items={calorieFAQs} />
      </article>
    </div>
  );
}
