"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, Input, Tab, Tabs } from "@nextui-org/react";
import { Plus, Trash2, Calculator, BookOpen, Percent, Award } from "lucide-react";
import FAQ from "@/components/FAQ";
import AdPlaceholder from "@/components/AdPlaceholder";
import {
  GradeRow,
  CalculationResult,
  calculatePercentageMode,
  calculateLetterMode,
  calculatePointsMode,
  calculateRequiredFinalGrade
} from "@/lib/gradeCalculations";

const gradeFAQs = [
  {
    question: "What is a weighted grade, and how does it work?",
    answer: "A weighted grade is a calculation method where different class categories (e.g., homework, quizzes, exams) contribute different percentages toward your final grade. For example, if exams are weighted at 60% and homework is 40%, an exam grade has a greater impact on your final score than a homework grade. You calculate it by multiplying each category score by its weight, summing those values, and dividing by the total weight."
  },
  {
    question: "How do I calculate what score I need on my final exam?",
    answer: "To calculate the required final exam grade, use this formula: Required Final Score = (Target Grade * 100 - Current Grade * (100 - Final Exam Weight)) / Final Exam Weight. For example, if you have an 80% current grade, want an 85% final class grade, and the final exam is worth 25%, you would need to score (85 * 100 - 80 * 75) / 25 = 100% on the final exam."
  },
  {
    question: "What if my category weights do not add up to 100%?",
    answer: "If your weights do not sum to 100%, the calculator normalizes them. It sums up the weighted scores and divides them by the total weight of categories completed so far. This gives you an accurate representation of your current grade in the class based only on the graded work available."
  },
  {
    question: "How does the letter grade calculation work?",
    answer: "In Letter Grade Mode, the calculator maps each letter grade to its corresponding standard percentage midpoint (e.g., A = 95.0%, B = 85.0%, C = 75.0%). It computes a weighted average of these percentages based on your category weights, then maps the final average percentage back to a letter grade using standard boundaries (e.g., >= 93% is an A)."
  },
  {
    question: "What is the difference between simple points and weighted points?",
    answer: "In Points Mode, if you leave the 'Weight' fields blank, the calculator calculates a simple points average: (Total Points Earned / Total Max Points) * 100. If you enter weights, it treats each row as a weighted category (e.g., category score = points earned / max points * 100) and calculates the weighted average based on those category weights."
  }
];

const LETTER_GRADES = ["A+", "A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "D-", "F"];

export default function GradeCalculator() {
  const [activeTab, setActiveTab] = useState<"weighted" | "final">("weighted");
  const [gradeType, setGradeType] = useState<"percentage" | "letter" | "points">("percentage");

  // Weighted Average Calculator state
  const createEmptyRow = (type: "percentage" | "letter" | "points"): GradeRow => ({
    id: Math.random().toString(36).substring(2, 9),
    name: "",
    grade: type === "letter" ? "A" : "",
    weight: "",
    pointsEarned: "",
    maxPoints: "",
  });

  const [rows, setRows] = useState<GradeRow[]>([]);
  const [weightedResult, setWeightedResult] = useState<CalculationResult | null>(null);
  const [weightedError, setWeightedError] = useState("");

  // Initialize rows
  useEffect(() => {
    setRows([
      createEmptyRow(gradeType),
      createEmptyRow(gradeType),
      createEmptyRow(gradeType),
    ]);
    setWeightedResult(null);
    setWeightedError("");
  }, [gradeType]);

  const handleAddRow = () => {
    setRows([...rows, createEmptyRow(gradeType)]);
  };

  const handleRemoveRow = (id: string) => {
    if (rows.length > 1) {
      setRows(rows.filter((row) => row.id !== id));
    } else {
      setWeightedError("You must keep at least one row.");
    }
  };

  const handleRowChange = (id: string, field: keyof GradeRow, value: string) => {
    setRows(
      rows.map((row) => {
        if (row.id === id) {
          return { ...row, [field]: value };
        }
        return row;
      })
    );
  };

  const calculateWeightedAverage = () => {
    setWeightedError("");
    setWeightedResult(null);

    // Validate inputs
    let hasValidData = false;
    for (const row of rows) {
      if (gradeType === "percentage") {
        if (row.grade.trim() !== "" && row.weight.trim() !== "") {
          hasValidData = true;
        }
      } else if (gradeType === "letter") {
        if (row.grade.trim() !== "" && row.weight.trim() !== "") {
          hasValidData = true;
        }
      } else if (gradeType === "points") {
        if (
          (row.pointsEarned?.trim() !== "" && row.maxPoints?.trim() !== "")
        ) {
          hasValidData = true;
        }
      }
    }

    if (!hasValidData) {
      setWeightedError("Please fill out at least one row with valid grades and weights/points.");
      return;
    }

    let res: CalculationResult;
    if (gradeType === "percentage") {
      res = calculatePercentageMode(rows);
    } else if (gradeType === "letter") {
      res = calculateLetterMode(rows);
    } else {
      res = calculatePointsMode(rows);
    }

    if (res.hasErrors) {
      setWeightedError(res.errorMessage || "Calculation failed. Please check your inputs.");
    } else {
      if (typeof window !== "undefined" && (window as any).gtag) {
        (window as any).gtag("event", "calculate", {
          event_category: "calculator",
          event_label: "Weighted Grade Calculator",
          grade_type: gradeType,
        });
      }
      setWeightedResult(res);
    }
  };

  // Final Exam Grade Calculator state
  const [currentGrade, setCurrentGrade] = useState("");
  const [targetGrade, setTargetGrade] = useState("");
  const [finalWeight, setFinalWeight] = useState("");
  const [finalResult, setFinalResult] = useState<{
    requiredGrade: number;
    message: string;
    isPossible: boolean;
  } | null>(null);
  const [finalError, setFinalError] = useState("");

  const calculateFinalGrade = () => {
    setFinalError("");
    setFinalResult(null);

    const current = parseFloat(currentGrade);
    const target = parseFloat(targetGrade);
    const weight = parseFloat(finalWeight);

    if (isNaN(current) || current < 0) {
      setFinalError("Please enter a valid current grade percentage.");
      return;
    }
    if (isNaN(target) || target < 0) {
      setFinalError("Please enter a valid target grade percentage.");
      return;
    }
    if (isNaN(weight) || weight <= 0 || weight > 100) {
      setFinalError("Please enter a final exam weight percentage between 0.1 and 100.");
      return;
    }

    const res = calculateRequiredFinalGrade(current, target, weight);
    
    if (typeof window !== "undefined" && (window as any).gtag) {
      (window as any).gtag("event", "calculate", {
        event_category: "calculator",
        event_label: "Final Grade Calculator",
        value: target,
      });
    }

    setFinalResult(res);
  };

  // Reset helpers
  const resetWeighted = () => {
    setRows([
      createEmptyRow(gradeType),
      createEmptyRow(gradeType),
      createEmptyRow(gradeType),
    ]);
    setWeightedResult(null);
    setWeightedError("");
  };

  const resetFinal = () => {
    setCurrentGrade("");
    setTargetGrade("");
    setFinalWeight("");
    setFinalResult(null);
    setFinalError("");
  };

  // Auto-scroll to results
  useEffect(() => {
    if (weightedResult !== null) {
      const el = document.getElementById("weighted-results");
      if (el) {
        setTimeout(() => {
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 100;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }, 100);
      }
    }
  }, [weightedResult]);

  useEffect(() => {
    if (finalResult !== null) {
      const el = document.getElementById("final-results");
      if (el) {
        setTimeout(() => {
          const elementPosition = el.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - 100;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }, 100);
      }
    }
  }, [finalResult]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 pb-20">
      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
            Grade Calculator
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Calculate your weighted class averages, letter grades, points, GPA, or determine the exact score required on your final exam to hit your target.
          </p>

          <div className="max-w-2xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 shadow-lg rounded-none p-1">
              <CardHeader className="flex flex-col gap-3 pb-4 pt-6 border-b border-gray-100 dark:border-gray-800">
                <Tabs
                  selectedKey={activeTab}
                  onSelectionChange={(key) => {
                    setActiveTab(key as "weighted" | "final");
                  }}
                  color="primary"
                  variant="solid"
                  classNames={{
                    tabList: "bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 w-full flex-wrap",
                    cursor: "bg-blue-600 dark:bg-blue-600 text-white font-bold",
                    tabContent: "font-semibold text-gray-600 dark:text-gray-400 group-data-[selected=true]:text-white"
                  }}
                >
                  <Tab key="weighted" title="Weighted Class Grade" />
                  <Tab key="final" title="Final Exam Needed" />
                </Tabs>
              </CardHeader>
              
              <CardContent className="p-6">
                {activeTab === "weighted" ? (
                  // TAB 1: Weighted Average Grade
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div>
                        <h3 className="text-base font-bold text-gray-900 dark:text-gray-100">Grade Type / Input Mode</h3>
                        <p className="text-xs text-gray-500">Choose how your assignments are graded.</p>
                      </div>
                      <Tabs
                        selectedKey={gradeType}
                        onSelectionChange={(key) => setGradeType(key as "percentage" | "letter" | "points")}
                        size="sm"
                        color="secondary"
                        variant="bordered"
                        classNames={{
                          tabList: "border-gray-300 dark:border-gray-800",
                          tabContent: "font-medium"
                        }}
                      >
                        <Tab key="percentage" title="Percentage (%)" />
                        <Tab key="letter" title="Letter Grade" />
                        <Tab key="points" title="Points" />
                      </Tabs>
                    </div>

                    <hr className="border-gray-200 dark:border-gray-800" />

                    {/* Table-like Form Rows */}
                    <div className="space-y-3">
                      <div className="hidden md:grid md:grid-cols-12 gap-3 text-xs font-bold uppercase tracking-wider text-gray-400 pb-1 px-1">
                        <div className="col-span-5">Assignment/Category</div>
                        <div className="col-span-3">Grade</div>
                        <div className="col-span-3">
                          {gradeType === "points" ? "Max Points / Weight" : "Weight (%)"}
                        </div>
                        <div className="col-span-1 text-center">Delete</div>
                      </div>

                      <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                        {rows.map((row, index) => (
                          <div
                            key={row.id}
                            className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center border border-gray-200 dark:border-gray-800 p-3 md:p-1 rounded bg-gray-50/50 dark:bg-gray-950/30"
                          >
                            {/* Category Name */}
                            <div className="col-span-1 md:col-span-5">
                              <span className="block md:hidden text-xs font-semibold text-gray-400 mb-1">Assignment / Category</span>
                              <input
                                type="text"
                                placeholder={`e.g., Category ${index + 1}`}
                                value={row.name}
                                onChange={(e) => handleRowChange(row.id, "name", e.target.value)}
                                className="w-full h-10 px-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                              />
                            </div>

                            {/* Grade Input */}
                            <div className="col-span-1 md:col-span-3">
                              <span className="block md:hidden text-xs font-semibold text-gray-400 mb-1">Grade</span>
                              {gradeType === "percentage" && (
                                <div className="relative">
                                  <input
                                    type="number"
                                    placeholder="e.g. 95"
                                    value={row.grade}
                                    onChange={(e) => handleRowChange(row.id, "grade", e.target.value)}
                                    className="w-full h-10 pl-3 pr-8 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  />
                                  <span className="absolute right-3 top-2.5 text-gray-400 text-xs">%</span>
                                </div>
                              )}
                              {gradeType === "letter" && (
                                <select
                                  value={row.grade}
                                  onChange={(e) => handleRowChange(row.id, "grade", e.target.value)}
                                  className="w-full h-10 px-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                  {LETTER_GRADES.map((l) => (
                                    <option key={l} value={l}>
                                      {l}
                                    </option>
                                  ))}
                                </select>
                              )}
                              {gradeType === "points" && (
                                <div className="relative">
                                  <input
                                    type="number"
                                    placeholder="Earned"
                                    value={row.pointsEarned || ""}
                                    onChange={(e) => handleRowChange(row.id, "pointsEarned", e.target.value)}
                                    className="w-full h-10 px-3 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Weight / Max Points Input */}
                            <div className="col-span-1 md:col-span-3">
                              <span className="block md:hidden text-xs font-semibold text-gray-400 mb-1">
                                {gradeType === "points" ? "Max Points & Weight" : "Weight"}
                              </span>
                              {gradeType === "points" ? (
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="number"
                                    placeholder="Max"
                                    value={row.maxPoints || ""}
                                    onChange={(e) => handleRowChange(row.id, "maxPoints", e.target.value)}
                                    className="w-full h-10 px-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  />
                                  <div className="relative">
                                    <input
                                      type="number"
                                      placeholder="Wt%"
                                      value={row.weight || ""}
                                      onChange={(e) => handleRowChange(row.id, "weight", e.target.value)}
                                      className="w-full h-10 pl-2 pr-5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-xs"
                                    />
                                    <span className="absolute right-1 top-2.5 text-gray-400 text-[10px]">%</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    type="number"
                                    placeholder="e.g. 20"
                                    value={row.weight}
                                    onChange={(e) => handleRowChange(row.id, "weight", e.target.value)}
                                    className="w-full h-10 pl-3 pr-8 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-800 rounded text-sm text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                  />
                                  <span className="absolute right-3 top-2.5 text-gray-400 text-xs">%</span>
                                </div>
                              )}
                            </div>

                            {/* Delete Row button */}
                            <div className="col-span-1 md:col-span-1 text-center flex justify-end md:justify-center">
                              <Button
                                isIconOnly
                                size="sm"
                                variant="light"
                                color="danger"
                                onPress={() => handleRemoveRow(row.id)}
                                disabled={rows.length <= 1}
                                className="min-w-8 h-8 rounded-full"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-3">
                      <Button
                        variant="bordered"
                        color="secondary"
                        onPress={handleAddRow}
                        startContent={<Plus className="h-4 w-4" />}
                        className="flex-1 font-bold h-12 rounded border-2 border-purple-500/30 dark:border-purple-500/30 hover:bg-purple-500/10 text-purple-600 dark:text-purple-400"
                      >
                        Add Category Row
                      </Button>
                      <Button
                        variant="bordered"
                        color="warning"
                        onPress={resetWeighted}
                        className="font-bold h-12 rounded border-2 border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-400"
                      >
                        Reset Form
                      </Button>
                    </div>

                    {weightedError && (
                      <div className="text-red-700 dark:text-red-300 text-sm font-semibold bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-800 text-center">
                        {weightedError}
                      </div>
                    )}

                    <Button
                      color="primary"
                      onPress={calculateWeightedAverage}
                      startContent={<Calculator className="h-5 w-5" />}
                      className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors border-0"
                    >
                      Calculate Class Grade
                    </Button>
                  </div>
                ) : (
                  // TAB 2: Final Exam Grade Needed
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="Current Class Grade"
                        labelPlacement="outside"
                        placeholder="e.g. 82.5"
                        value={currentGrade}
                        onValueChange={setCurrentGrade}
                        endContent={<span className="text-gray-400 text-sm">%</span>}
                        variant="bordered"
                        classNames={{
                          inputWrapper: "border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                          label: "text-gray-700 dark:text-gray-300 font-bold",
                          input: "text-gray-900 dark:text-white font-semibold text-lg"
                        }}
                      />
                      <Input
                        type="number"
                        label="Target Class Grade"
                        labelPlacement="outside"
                        placeholder="e.g. 90.0"
                        value={targetGrade}
                        onValueChange={setTargetGrade}
                        endContent={<span className="text-gray-400 text-sm">%</span>}
                        variant="bordered"
                        classNames={{
                          inputWrapper: "border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                          label: "text-gray-700 dark:text-gray-300 font-bold",
                          input: "text-gray-900 dark:text-white font-semibold text-lg"
                        }}
                      />
                    </div>

                    <Input
                      type="number"
                      label="Final Exam Weight"
                      labelPlacement="outside"
                      placeholder="e.g. 20.0"
                      value={finalWeight}
                      onValueChange={setFinalWeight}
                      endContent={<span className="text-gray-400 text-sm">%</span>}
                      variant="bordered"
                      classNames={{
                        inputWrapper: "border-gray-300 dark:border-gray-800 bg-white dark:bg-gray-950 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                        label: "text-gray-700 dark:text-gray-300 font-bold",
                        input: "text-gray-900 dark:text-white font-semibold text-lg"
                      }}
                    />

                    <div className="flex gap-3 pt-2">
                      <Button
                        variant="bordered"
                        color="warning"
                        onPress={resetFinal}
                        className="flex-1 font-bold h-12 rounded border-2 border-gray-300 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/40 text-gray-600 dark:text-gray-400"
                      >
                        Reset Form
                      </Button>
                    </div>

                    {finalError && (
                      <div className="text-red-700 dark:text-red-300 text-sm font-semibold bg-red-50 dark:bg-red-900/30 p-3 rounded border border-red-200 dark:border-red-800 text-center">
                        {finalError}
                      </div>
                    )}

                    <Button
                      color="primary"
                      onPress={calculateFinalGrade}
                      startContent={<Calculator className="h-5 w-5" />}
                      className="w-full h-14 text-base font-bold bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors border-0"
                    >
                      Calculate Required Final Grade
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Rendering Section */}
      <div className="container mx-auto px-4 py-8 space-y-12 max-w-5xl">
        <AdPlaceholder position="top" />

        {/* Tab 1 Results */}
        {activeTab === "weighted" && weightedResult !== null && (
          <div id="weighted-results" className="max-w-2xl mx-auto space-y-6">
            <Card className="glass border-2 border-purple-500/30 bg-transparent text-center p-8 rounded-none shadow-md">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-4 mb-4">
                Class Grade Results
              </h3>
              
              <div className="grid grid-cols-3 gap-4 py-4">
                <div className="space-y-1">
                  <div className="text-xs text-gray-400 font-semibold uppercase">Weighted Grade</div>
                  <div className="text-3xl md:text-4xl font-extrabold text-blue-600 dark:text-blue-400">
                    {weightedResult.averagePercentage.toFixed(2)}%
                  </div>
                </div>
                <div className="space-y-1 border-x border-gray-200 dark:border-gray-800">
                  <div className="text-xs text-gray-400 font-semibold uppercase">Letter Grade</div>
                  <div className="text-3xl md:text-4xl font-extrabold text-purple-600 dark:text-purple-400">
                    {weightedResult.averageLetter}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-xs text-gray-400 font-semibold uppercase">Class GPA</div>
                  <div className="text-3xl md:text-4xl font-extrabold text-amber-500 dark:text-amber-500">
                    {weightedResult.averageGpa.toFixed(2)}
                  </div>
                </div>
              </div>

              {weightedResult.totalWeight !== 100 && (
                <div className="mt-4 p-3 bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-xs border border-yellow-500/20 rounded">
                  Note: Your category weights sum to {weightedResult.totalWeight.toFixed(2)}% (not 100%). Grades have been mathematically normalized to represent your grade in categories completed so far.
                </div>
              )}

              <div className="mt-6 text-left space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Formula Breakdown</h4>
                <div className="bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded text-xs font-mono text-gray-700 dark:text-gray-300 break-all">
                  {weightedResult.formulaBreakdown}
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tab 2 Results */}
        {activeTab === "final" && finalResult !== null && (
          <div id="final-results" className="max-w-2xl mx-auto">
            <Card className="glass border-2 border-purple-500/30 bg-transparent text-center p-8 rounded-none shadow-md space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-gray-800 pb-4">
                Required Final Exam Score
              </h3>

              <div className="py-2">
                <div className="text-5xl md:text-6xl font-black text-blue-600 dark:text-blue-400">
                  {finalResult.requiredGrade.toFixed(2)}%
                </div>
                <div className="text-gray-400 text-sm mt-2 font-medium">Minimum Score Required</div>
              </div>

              <div className={`p-4 rounded border text-sm font-medium ${
                finalResult.requiredGrade > 100
                  ? "bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-400"
                  : finalResult.requiredGrade <= 0
                  ? "bg-green-500/10 border-green-500/20 text-green-700 dark:text-green-400"
                  : "bg-blue-500/10 border-blue-500/20 text-blue-700 dark:text-blue-400"
              }`}>
                {finalResult.message}
              </div>

              <div className="text-left space-y-2 mt-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">The Math Behind Your Grade</h4>
                <div className="bg-gray-100 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 p-4 rounded text-xs font-mono text-gray-700 dark:text-gray-300">
                  Required Final = ({targetGrade}% × 100 - {currentGrade}% × (100 - {finalWeight}%)) / {finalWeight}% = {finalResult.requiredGrade.toFixed(2)}%
                </div>
              </div>
            </Card>
          </div>
        )}

        <AdPlaceholder position="bottom" />
      </div>

      {/* SEO Thick Copy Section */}
      <article className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 p-8 rounded-none mb-12 space-y-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-800 pb-2">
            The Complete Guide to Calculating Grades
          </h2>
          
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              Calculating your class grade is essential for academic planning and tracking. Whether you are in high school, college, or university, understanding how educators score your assignments helps you manage your study time effectively. Different courses utilize varying grading schemes, from simple total points systems to complex weighted categories.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 flex items-center gap-2">
              <Percent className="h-5 w-5 text-blue-500" />
              How Weighted Grades Work
            </h3>
            <p>
              Under a weighted grade system, different assignments or categories represent a fixed percentage of your final grade. Common categories include:
            </p>
            <ul className="list-disc pl-5 space-y-1">
              <li><strong>Exams/Tests:</strong> Often weighted heavily (e.g., 40% to 60%).</li>
              <li><strong>Quizzes:</strong> Weighted moderately (e.g., 15% to 25%).</li>
              <li><strong>Homework/Assignments:</strong> Worth a lower percentage (e.g., 10% to 20%).</li>
              <li><strong>Participation:</strong> Minor contribution (e.g., 5% to 10%).</li>
            </ul>
            <p>
              To calculate your overall grade, multiply the score you got in each category by its decimal weight (e.g., a 20% weight is 0.20), add the products together, and then divide by the sum of weights.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-500" />
              GPA Scales and Letter Conversions
            </h3>
            <p>
              Letter grades (like A+, B, C-) map to a standard Grade Point Average (GPA) scale, usually on a 4.0 or 4.33 scale. The standard 4.33 GPA scale used by the calculator aligns with universities:
            </p>
            <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-800 text-left text-sm mt-3">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-200 dark:border-gray-750 p-2">Letter</th>
                  <th className="border border-gray-200 dark:border-gray-750 p-2">GPA Value</th>
                  <th className="border border-gray-200 dark:border-gray-750 p-2">Percentage Boundary</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-750 p-2 font-bold">A+</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">4.33</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">&gt;= 97%</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-750 p-2 font-bold">A</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">4.00</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">93% - 96%</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-750 p-2 font-bold">A-</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">3.67</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">90% - 92%</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-750 p-2 font-bold">B+</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">3.33</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">87% - 89%</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-750 p-2 font-bold">B</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">3.00</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">83% - 86%</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-750 p-2 font-bold">C</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">2.00</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">73% - 76%</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-750 p-2 font-bold">D</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">1.00</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">63% - 66%</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-750 p-2 font-bold">F</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">0.00</td>
                  <td className="border border-gray-200 dark:border-gray-750 p-2">&lt; 60%</td>
                </tr>
              </tbody>
            </table>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-500" />
              Points-Based Grading Systems
            </h3>
            <p>
              In points-based systems, every assignment is assigned a maximum number of points (e.g., 50 points for a project, 100 points for an exam). Your grade is computed by dividing your total earned points across all assignments by the total maximum possible points. If your teacher weights points categories (such as putting homework points in a 20% category and exam points in an 80% category), you must calculate the average percentage of points earned in each category first, then calculate the weighted average of those percentages.
            </p>
          </div>
        </div>

        {/* FAQs component */}
        <FAQ items={gradeFAQs} />
      </article>
    </div>
  );
}
