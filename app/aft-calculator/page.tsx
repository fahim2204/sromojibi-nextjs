"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardBody as CardContent, Button, Input, Tab, Tabs } from "@nextui-org/react";
import { Dumbbell, Zap, Hourglass, Activity, Timer } from "lucide-react";
import { calculateEventScore, parseTimeToSeconds } from "@/lib/aftCalculations";
import FAQ from "@/components/FAQ";
import AdPlaceholder from "@/components/AdPlaceholder";

const aftFAQs = [
  {
    question: "What is the Army Fitness Test (AFT)?",
    answer: "The AFT is the new physical fitness standard for the U.S. Army, replacing the Army Combat Fitness Test (ACFT) as the official test of record starting June 1, 2025. It evaluates physical readiness through five key events: the 3-Rep Max Deadlift, Hand-Release Push-Up, Sprint-Drag-Carry, Plank, and Two-Mile Run."
  },
  {
    question: "What are the passing standards for the AFT?",
    answer: "To pass, Soldiers must score a minimum of 60 points in each of the five physical events. In addition, there is a total score threshold: Soldiers in 21 designated Combat MOS categories must achieve at least 350 total points. All other roles require a minimum of 300 total points. Scoring below 60 points in any single event results in a test failure."
  },
  {
    question: "Are the standards age- and gender-normed?",
    answer: "Yes, standard rules apply depending on your duty classification. The Combat MOS standard is sex-neutral (using the male scoring table for all soldiers) but is age-normed. The General Standard for support and other MOS categories is both age-normed and performance-normed by gender."
  },
  {
    question: "What changed from the previous ACFT?",
    answer: "The primary change in the transition from the ACFT to the AFT is the removal of the Standing Power Throw (SPT) event. This reduces the test from six events to five, and changes the maximum possible score from 600 to 500 points. The remaining five events have also updated their grading scales to align with MOS-specific data."
  },
  {
    question: "How are scores computed for values between the chart ticks?",
    answer: "For performance values falling between standard scores listed on the official charts, scores are calculated using linear interpolation and rounded to the nearest whole point. This calculator implements the exact official interpolation formulas to ensure your computed score is precise."
  },
  {
    question: "How does the AFT affect promotion points?",
    answer: "Your AFT score is a critical factor for promotions (especially for E-5 and E-6 ranks), contributing up to 120 promotion points depending on your score class. High scores demonstrate leadership, physical fitness, and operational readiness."
  }
];

export default function AFTCalculator() {
  const [scoringStandard, setScoringStandard] = useState<"combat" | "general-m" | "general-f">("combat");
  const [ageGroup, setAgeGroup] = useState<string>("22-26");

  // Raw inputs state
  const [deadliftLbs, setDeadliftLbs] = useState("140");
  const [pushupsReps, setPushupsReps] = useState("20");
  
  const [sdcMin, setSdcMin] = useState("2");
  const [sdcSec, setSdcSec] = useState("30");

  const [plankMin, setPlankMin] = useState("1");
  const [plankSec, setPlankSec] = useState("40");

  const [runMin, setRunMin] = useState("20");
  const [runSec, setRunSec] = useState("0");

  const [error, setError] = useState("");
  const [showResults, setShowResults] = useState(false);

  // Map standard to gender for lookup
  const gender = useMemo(() => {
    return scoringStandard === "general-f" ? "F" : "M";
  }, [scoringStandard]);

  // Event Scores & Total calculation
  const scores = useMemo(() => {
    const dlVal = parseInt(deadliftLbs, 10) || 0;
    const puVal = parseInt(pushupsReps, 10) || 0;
    
    const sdcTotalSeconds = parseTimeToSeconds(sdcMin, sdcSec);
    const plankTotalSeconds = parseTimeToSeconds(plankMin, plankSec);
    const runTotalSeconds = parseTimeToSeconds(runMin, runSec);

    const dlScore = calculateEventScore(dlVal, "deadlift", gender, ageGroup);
    const puScore = calculateEventScore(puVal, "pushups", gender, ageGroup);
    const sdcScore = calculateEventScore(sdcTotalSeconds, "sdc", gender, ageGroup);
    const plankScore = calculateEventScore(plankTotalSeconds, "plank", gender, ageGroup);
    const runScore = calculateEventScore(runTotalSeconds, "run", gender, ageGroup);

    const total = dlScore + puScore + sdcScore + plankScore + runScore;

    return {
      deadlift: dlScore,
      pushups: puScore,
      sdc: sdcScore,
      plank: plankScore,
      run: runScore,
      total
    };
  }, [deadliftLbs, pushupsReps, sdcMin, sdcSec, plankMin, plankSec, runMin, runSec, gender, ageGroup]);

  // Determine readiness status and passing status
  const passFailStatus = useMemo(() => {
    const eventValues = [scores.deadlift, scores.pushups, scores.sdc, scores.plank, scores.run];
    const meetsMinPerEvent = eventValues.every(val => val >= 60);

    const targetTotal = scoringStandard === "combat" ? 350 : 300;
    const passed = meetsMinPerEvent && scores.total >= targetTotal;

    let text = "DOES NOT MEET MINIMUM";
    let color = "text-red-400 bg-red-500/10 border-red-500/30";
    let isCombatReady = false;

    if (meetsMinPerEvent) {
      if (scores.total >= 350) {
        text = "COMBAT READY";
        color = "text-green-400 bg-green-500/10 border-green-500/30";
        isCombatReady = true;
      } else if (scores.total >= 300) {
        text = "GENERAL READY";
        color = "text-sky-400 bg-sky-500/10 border-sky-500/30";
      } else {
        text = "BELOW STANDARD";
        color = "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      }
    }

    return {
      passed,
      text,
      color,
      isCombatReady,
      targetTotal
    };
  }, [scores, scoringStandard]);

  const handleCalculate = () => {
    setError("");
    
    // Simple checks
    const dl = parseInt(deadliftLbs, 10);
    const pu = parseInt(pushupsReps, 10);
    
    if (isNaN(dl) || dl < 0) {
      setError("Please enter a valid weight for Maximum Deadlift.");
      return;
    }
    if (isNaN(pu) || pu < 0) {
      setError("Please enter a valid number of repetitions for Push-ups.");
      return;
    }
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'calculate', {
        event_category: 'calculator',
        event_label: 'AFT Calculator',
        value: scores.total
      });
    }

    setShowResults(true);
  };

  // Auto-scroll to results
  useEffect(() => {
    if (showResults) {
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
  }, [showResults]);

  // Helpers to get point rating colors
  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-400";
    if (score >= 80) return "text-sky-400";
    if (score >= 70) return "text-yellow-400";
    if (score >= 60) return "text-orange-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-gray-950 dark:text-gray-100 pb-20">
      {/* Hero Section */}
      <section className="pt-12 pb-16 px-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
            AFT Score Calculator (Army Fitness Test)
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-2xl mx-auto">
            Check your score against the current U.S. Army fitness standards effective June 1, 2025. Age-normed and gender-neutral tables supported.
          </p>

          <div className="max-w-xl mx-auto text-left">
            <Card className="bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 shadow-sm rounded-none">
              <CardHeader className="flex flex-col gap-2 pb-4 pt-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">Enter Test Parameters</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select your scoring category, age bracket, and raw physical performance results below.
                </p>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                
                {/* Standard / Duty Type */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Scoring Category</label>
                  <Tabs 
                    selectedKey={scoringStandard} 
                    onSelectionChange={(key) => setScoringStandard(key as "combat" | "general-m" | "general-f")}
                    size="md"
                    color="primary"
                    variant="bordered"
                    classNames={{
                      tabList: "border-gray-300 dark:border-gray-700 w-full grid grid-cols-3",
                      tabContent: "text-gray-700 dark:text-gray-300"
                    }}
                  >
                    <Tab key="combat" title="Combat MOS" />
                    <Tab key="general-m" title="General (Male)" />
                    <Tab key="general-f" title="General (Female)" />
                  </Tabs>
                </div>

                {/* Age Bracket */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Age Group</label>
                  <div className="flex flex-wrap gap-1">
                    {["17-21", "22-26", "27-31", "32-36", "37-41", "42-46", "47-51", "52-56", "57-61", "62+"].map((age) => (
                      <button
                        key={age}
                        type="button"
                        onClick={() => setAgeGroup(age)}
                        className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition-colors ${
                          ageGroup === age
                            ? "border-blue-500 bg-blue-500 text-white shadow-sm"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:border-blue-500 dark:hover:bg-blue-900/20"
                        }`}
                      >
                        {age}
                      </button>
                    ))}
                  </div>
                </div>

                <hr className="border-gray-200 dark:border-gray-700 my-4" />

                {/* Deadlift & Pushups */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label="3-Rep Max Deadlift"
                    labelPlacement="outside"
                    placeholder="e.g. 140"
                    endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">lbs</span></div>}
                    value={deadliftLbs}
                    onValueChange={setDeadliftLbs}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                      label: "text-gray-700 dark:text-gray-300 font-medium",
                      input: "text-gray-900 dark:text-white font-semibold text-lg",
                    }}
                  />
                  <Input
                    type="number"
                    label="Hand-Release Push-Ups"
                    labelPlacement="outside"
                    placeholder="e.g. 20"
                    endContent={<div className="pointer-events-none flex items-center"><span className="text-gray-500 text-small">reps</span></div>}
                    value={pushupsReps}
                    onValueChange={setPushupsReps}
                    variant="bordered"
                    classNames={{
                      inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 focus-within:border-blue-500 dark:focus-within:border-blue-500",
                      label: "text-gray-700 dark:text-gray-300 font-medium",
                      input: "text-gray-900 dark:text-white font-semibold text-lg",
                    }}
                  />
                </div>

                {/* SDC Time */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Sprint-Drag-Carry Time</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      endContent={<span className="text-gray-500 text-xs">min</span>}
                      value={sdcMin}
                      onValueChange={setSdcMin}
                      variant="bordered"
                      classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                    />
                    <Input
                      type="number"
                      placeholder="Sec"
                      endContent={<span className="text-gray-500 text-xs">sec</span>}
                      value={sdcSec}
                      onValueChange={setSdcSec}
                      variant="bordered"
                      classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                    />
                  </div>
                </div>

                {/* Plank Hold */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Plank Hold Duration</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      endContent={<span className="text-gray-500 text-xs">min</span>}
                      value={plankMin}
                      onValueChange={setPlankMin}
                      variant="bordered"
                      classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                    />
                    <Input
                      type="number"
                      placeholder="Sec"
                      endContent={<span className="text-gray-500 text-xs">sec</span>}
                      value={plankSec}
                      onValueChange={setPlankSec}
                      variant="bordered"
                      classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                    />
                  </div>
                </div>

                {/* Two-Mile Run */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Two-Mile Run Time</label>
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Min"
                      endContent={<span className="text-gray-500 text-xs">min</span>}
                      value={runMin}
                      onValueChange={setRunMin}
                      variant="bordered"
                      classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                    />
                    <Input
                      type="number"
                      placeholder="Sec"
                      endContent={<span className="text-gray-500 text-xs">sec</span>}
                      value={runSec}
                      onValueChange={setRunSec}
                      variant="bordered"
                      classNames={{ inputWrapper: "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900" }}
                    />
                  </div>
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
                  Calculate AFT Score
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Results Section */}
      {showResults && (
        <div className="container mx-auto px-4 py-12 space-y-12 max-w-5xl">
          <AdPlaceholder position="top" />

          <div id="results" className="max-w-4xl mx-auto space-y-8">
            
            {/* Total score & summary banner */}
            <Card className="glass border border-purple-500/30 bg-transparent">
              <CardContent className="p-8 flex flex-col md:flex-row justify-between items-center text-center md:text-left gap-6">
                <div>
                  <h3 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">
                    Overall Performance Rating
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <span className="text-5xl font-black text-white tabular-nums">
                      {scores.total}
                    </span>
                    <span className="text-gray-400 text-lg">/ 500 Points</span>
                    
                    <span className={`px-4 py-1 rounded-full text-sm font-bold border ${passFailStatus.color}`}>
                      {passFailStatus.text}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-3">
                    Required total: <strong className="text-white">{passFailStatus.targetTotal} points</strong> (min. 60 pts per event)
                  </p>
                </div>
                
                <div className="flex flex-col items-center md:items-end">
                  <div className="text-gray-400 text-sm mb-1">Test Outcome</div>
                  <span className={`text-3xl font-extrabold px-6 py-2 rounded-md ${
                    passFailStatus.passed 
                      ? "text-green-500 border-2 border-green-500 bg-green-500/10" 
                      : "text-red-500 border-2 border-red-500 bg-red-500/10"
                  }`}>
                    {passFailStatus.passed ? "PASSED" : "FAILED"}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Individual Event Breakdown Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              {/* MDL Card */}
              <Card className="glass border border-white/10 bg-transparent flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-purple-500/10 p-2 rounded-lg border border-purple-500/20">
                        <Dumbbell className="h-5 w-5 text-purple-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">Deadlift (MDL)</h4>
                        <span className="text-gray-500 text-xs">3-Rep Max</span>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(scores.deadlift)}`}>
                      {scores.deadlift}
                    </span>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Weight Lifted:</div>
                    <div className="text-lg font-bold text-white mt-1">{deadliftLbs} lbs</div>
                  </div>
                </CardContent>
              </Card>

              {/* HRP Card */}
              <Card className="glass border border-white/10 bg-transparent flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-pink-500/10 p-2 rounded-lg border border-pink-500/20">
                        <Activity className="h-5 w-5 text-pink-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">Push-Up (HRP)</h4>
                        <span className="text-gray-500 text-xs">Hand-Release</span>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(scores.pushups)}`}>
                      {scores.pushups}
                    </span>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Repetitions:</div>
                    <div className="text-lg font-bold text-white mt-1">{pushupsReps} reps</div>
                  </div>
                </CardContent>
              </Card>

              {/* SDC Card */}
              <Card className="glass border border-white/10 bg-transparent flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-yellow-500/10 p-2 rounded-lg border border-yellow-500/20">
                        <Zap className="h-5 w-5 text-yellow-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">Sprint-Drag-Carry</h4>
                        <span className="text-gray-500 text-xs">Agility Shuttle</span>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(scores.sdc)}`}>
                      {scores.sdc}
                    </span>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Completion Time:</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {sdcMin}m {sdcSec}s
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* PLK Card */}
              <Card className="glass border border-white/10 bg-transparent flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
                        <Hourglass className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">Plank (PLK)</h4>
                        <span className="text-gray-500 text-xs">Core Hold</span>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(scores.plank)}`}>
                      {scores.plank}
                    </span>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Hold Duration:</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {plankMin}m {plankSec}s
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 2MR Card */}
              <Card className="glass border border-white/10 bg-transparent flex flex-col justify-between">
                <CardContent className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-500/10 p-2 rounded-lg border border-blue-500/20">
                        <Timer className="h-5 w-5 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-base">Two-Mile Run</h4>
                        <span className="text-gray-500 text-xs">Aerobic Run</span>
                      </div>
                    </div>
                    <span className={`text-2xl font-bold ${getScoreColor(scores.run)}`}>
                      {scores.run}
                    </span>
                  </div>
                  <div>
                    <div className="text-gray-400 text-sm">Run Time:</div>
                    <div className="text-lg font-bold text-white mt-1">
                      {runMin}m {runSec}s
                    </div>
                  </div>
                </CardContent>
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
            The Complete Guide to the Army Fitness Test (AFT)
          </h2>
          <div className="prose dark:prose-invert prose-blue max-w-none text-gray-700 dark:text-gray-300 space-y-4">
            <p>
              The Army Fitness Test (AFT) serves as the primary evaluation of a Soldier's combat fitness level, replacing the previous Army Combat Fitness Test (ACFT) on June 1, 2025. Designed by physical therapists, athletic trainers, and readiness experts, the AFT is structured to evaluate muscular strength, core stability, power, speed, and cardiovascular endurance to ensure that every Soldier is fully prepared for battle.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">AFT Events and Physical Requirements</h3>
            <p>
              The AFT consists of five key events. Each simulates common operational tasks that a Soldier might perform in the field.
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-2">
              <li>
                <strong>3-Repetition Maximum Deadlift (MDL):</strong> Evaluates a Soldier's lower-body muscular strength, grip strength, and spinal stability. It mimics lifting heavy gear, casualty evacuations, or loading ammunition.
              </li>
              <li>
                <strong>Hand-Release Push-Up (HRP):</strong> Measures upper-body muscular endurance and chest power. Soldiers start in a prone position, push up to full arm extension, lower themselves, lift their hands off the ground momentarily, and repeat.
              </li>
              <li>
                <strong>Sprint-Drag-Carry (SDC):</strong> A highly intensive timed event that measures anaerobic power, speed, agility, and pulling capacity. It includes five shuttle lanes: sprinting, dragging a 90-lb sled, lateral shuffling, carrying two 40-lb kettlebells, and a final sprint.
              </li>
              <li>
                <strong>Plank Hold (PLK):</strong> Replaces the old leg tuck, testing core stabilization, mid-section muscular endurance, and alignment under stress. Soldiers must hold a rigid plank on their elbows and toes.
              </li>
              <li>
                <strong>Two-Mile Run (2MR):</strong> Evaluates long-distance aerobic capacity and cardiovascular stamina. It replicates marches and patrols over extended periods of time.
              </li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mt-6">MOS Category Differences and Passing Tiers</h3>
            <p>
              Soldiers are evaluated based on their specific Military Occupational Specialty (MOS) requirements:
            </p>
            <table className="min-w-full border-collapse border border-gray-200 dark:border-gray-800 text-left text-sm mt-3">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-800">
                  <th className="border border-gray-200 dark:border-gray-700 p-2">Standard Category</th>
                  <th className="border border-gray-200 dark:border-gray-700 p-2">Minimum Score</th>
                  <th className="border border-gray-200 dark:border-gray-700 p-2">Scoring Type</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-700 p-2 font-medium">Combat MOS (21 Specialties)</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2">350 Points Total (Min 60/event)</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2">Age-normed, Gender-neutral (uses Male scale)</td>
                </tr>
                <tr>
                  <td className="border border-gray-200 dark:border-gray-700 p-2 font-medium">General Standard</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2">300 Points Total (Min 60/event)</td>
                  <td className="border border-gray-200 dark:border-gray-700 p-2">Age-normed, Gender-normed</td>
                </tr>
              </tbody>
            </table>
            
            <p className="mt-4">
              Failure to achieve at least 60 points in any individual event results in an immediate failure of the entire fitness test, regardless of how high the other event scores are.
            </p>
          </div>
        </div>

        <FAQ items={aftFAQs} />
      </article>
    </div>
  );
}
