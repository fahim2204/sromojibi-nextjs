export const letterToGpa: Record<string, number> = {
  "A+": 4.33,
  "A": 4.00,
  "A-": 3.67,
  "B+": 3.33,
  "B": 3.00,
  "B-": 2.67,
  "C+": 2.33,
  "C": 2.00,
  "C-": 1.67,
  "D+": 1.33,
  "D": 1.00,
  "D-": 0.67,
  "F": 0.00,
};

export const letterToPercentageMidpoint: Record<string, number> = {
  "A+": 98.5,
  "A": 95.0,
  "A-": 91.5,
  "B+": 88.5,
  "B": 85.0,
  "B-": 81.5,
  "C+": 78.5,
  "C": 75.0,
  "C-": 71.5,
  "D+": 68.5,
  "D": 65.0,
  "D-": 61.5,
  "F": 30.0,
};

export function percentageToLetter(pct: number): string {
  if (pct >= 97) return "A+";
  if (pct >= 93) return "A";
  if (pct >= 90) return "A-";
  if (pct >= 87) return "B+";
  if (pct >= 83) return "B";
  if (pct >= 80) return "B-";
  if (pct >= 77) return "C+";
  if (pct >= 73) return "C";
  if (pct >= 70) return "C-";
  if (pct >= 67) return "D+";
  if (pct >= 63) return "D";
  if (pct >= 60) return "D-";
  return "F";
}

export function gpaToLetter(gpa: number): string {
  // Find closest letter grade based on GPA points
  let closestLetter = "F";
  let minDiff = Infinity;
  for (const [letter, value] of Object.entries(letterToGpa)) {
    const diff = Math.abs(value - gpa);
    if (diff < minDiff) {
      minDiff = diff;
      closestLetter = letter;
    }
  }
  return closestLetter;
}

export interface GradeRow {
  id: string;
  name: string;
  grade: string;       // Can be percentage string, letter grade, or points earned
  weight: string;      // Weight string or max points
  pointsEarned?: string;
  maxPoints?: string;
}

export interface CalculationResult {
  averagePercentage: number;
  averageLetter: string;
  averageGpa: number;
  totalWeight: number;
  hasErrors: boolean;
  errorMessage?: string;
  formulaBreakdown: string;
}

// Calculate Percentage Mode
export function calculatePercentageMode(rows: GradeRow[]): CalculationResult {
  let sumWeightedGrades = 0;
  let sumWeights = 0;
  let validRowsCount = 0;

  for (const row of rows) {
    const gradeVal = parseFloat(row.grade);
    const weightVal = parseFloat(row.weight);

    if (!isNaN(gradeVal) && !isNaN(weightVal)) {
      sumWeightedGrades += gradeVal * weightVal;
      sumWeights += weightVal;
      validRowsCount++;
    }
  }

  if (validRowsCount === 0 || sumWeights === 0) {
    return {
      averagePercentage: 0,
      averageLetter: "F",
      averageGpa: 0,
      totalWeight: 0,
      hasErrors: true,
      errorMessage: "Please enter valid grades and weights.",
      formulaBreakdown: "",
    };
  }

  const averagePercentage = sumWeightedGrades / sumWeights;
  const averageLetter = percentageToLetter(averagePercentage);
  const averageGpa = letterToGpa[averageLetter] || 0;

  const formulaBreakdown = `Weighted Average = (${rows
    .filter((r) => !isNaN(parseFloat(r.grade)) && !isNaN(parseFloat(r.weight)))
    .map((r) => `${r.grade}% × ${r.weight}%`)
    .join(" + ")}) / ${sumWeights}% = ${averagePercentage.toFixed(2)}%`;

  return {
    averagePercentage,
    averageLetter,
    averageGpa,
    totalWeight: sumWeights,
    hasErrors: false,
    formulaBreakdown,
  };
}

// Calculate Letter Mode
export function calculateLetterMode(rows: GradeRow[]): CalculationResult {
  let sumWeightedPercentage = 0;
  let sumWeightedGpa = 0;
  let sumWeights = 0;
  let validRowsCount = 0;

  for (const row of rows) {
    const letter = row.grade.trim().toUpperCase();
    const weightVal = parseFloat(row.weight);

    if (letterToGpa[letter] !== undefined && !isNaN(weightVal)) {
      const gpa = letterToGpa[letter];
      const midpointPct = letterToPercentageMidpoint[letter];
      sumWeightedGpa += gpa * weightVal;
      sumWeightedPercentage += midpointPct * weightVal;
      sumWeights += weightVal;
      validRowsCount++;
    }
  }

  if (validRowsCount === 0 || sumWeights === 0) {
    return {
      averagePercentage: 0,
      averageLetter: "F",
      averageGpa: 0,
      totalWeight: 0,
      hasErrors: true,
      errorMessage: "Please enter valid letter grades and weights.",
      formulaBreakdown: "",
    };
  }

  const averageGpa = sumWeightedGpa / sumWeights;
  const averagePercentage = sumWeightedPercentage / sumWeights;
  const averageLetter = percentageToLetter(averagePercentage);

  const formulaBreakdown = `Weighted GPA = (${rows
    .filter((r) => letterToGpa[r.grade.trim().toUpperCase()] !== undefined && !isNaN(parseFloat(r.weight)))
    .map((r) => `${r.grade} (${letterToGpa[r.grade.trim().toUpperCase()]}) × ${r.weight}%`)
    .join(" + ")}) / ${sumWeights}% = GPA ${averageGpa.toFixed(2)} (${averageLetter})`;

  return {
    averagePercentage,
    averageLetter,
    averageGpa,
    totalWeight: sumWeights,
    hasErrors: false,
    formulaBreakdown,
  };
}

// Calculate Points Mode
export function calculatePointsMode(rows: GradeRow[]): CalculationResult {
  let totalEarned = 0;
  let totalMax = 0;
  let sumWeightedGrades = 0;
  let sumWeights = 0;
  let hasWeights = false;
  let validRowsCount = 0;

  // Check if any weights are supplied
  for (const row of rows) {
    const earnedVal = parseFloat(row.pointsEarned || "");
    const maxVal = parseFloat(row.maxPoints || "");
    const weightVal = parseFloat(row.weight || "");

    if (!isNaN(earnedVal) && !isNaN(maxVal)) {
      totalEarned += earnedVal;
      totalMax += maxVal;
      validRowsCount++;

      if (!isNaN(weightVal)) {
        hasWeights = true;
        sumWeightedGrades += (earnedVal / maxVal) * 100 * weightVal;
        sumWeights += weightVal;
      }
    }
  }

  if (validRowsCount === 0) {
    return {
      averagePercentage: 0,
      averageLetter: "F",
      averageGpa: 0,
      totalWeight: 0,
      hasErrors: true,
      errorMessage: "Please enter valid points earned and max points.",
      formulaBreakdown: "",
    };
  }

  let averagePercentage = 0;
  let formulaBreakdown = "";

  if (hasWeights && sumWeights > 0) {
    averagePercentage = sumWeightedGrades / sumWeights;
    formulaBreakdown = `Weighted Points Average = (${rows
      .filter((r) => !isNaN(parseFloat(r.pointsEarned || "")) && !isNaN(parseFloat(r.maxPoints || "")) && !isNaN(parseFloat(r.weight || "")))
      .map((r) => `(${r.pointsEarned}/${r.maxPoints} × 100) × ${r.weight}%`)
      .join(" + ")}) / ${sumWeights}% = ${averagePercentage.toFixed(2)}%`;
  } else {
    if (totalMax === 0) {
      return {
        averagePercentage: 0,
        averageLetter: "F",
        averageGpa: 0,
        totalWeight: 0,
        hasErrors: true,
        errorMessage: "Max points sum cannot be zero.",
        formulaBreakdown: "",
      };
    }
    averagePercentage = (totalEarned / totalMax) * 100;
    formulaBreakdown = `Total Points Average = (Total Earned: ${totalEarned}) / (Total Max: ${totalMax}) × 100 = ${averagePercentage.toFixed(2)}%`;
  }

  const averageLetter = percentageToLetter(averagePercentage);
  const averageGpa = letterToGpa[averageLetter] || 0;

  return {
    averagePercentage,
    averageLetter,
    averageGpa,
    totalWeight: hasWeights ? sumWeights : 100,
    hasErrors: false,
    formulaBreakdown,
  };
}

// Calculate Required Final Exam Grade
export function calculateRequiredFinalGrade(
  currentGrade: number,
  targetGrade: number,
  finalWeight: number
): { requiredGrade: number; message: string; isPossible: boolean } {
  if (finalWeight <= 0 || finalWeight > 100) {
    return {
      requiredGrade: 0,
      message: "Final exam weight must be between 0% and 100%.",
      isPossible: false,
    };
  }

  // Required = (Target * 100 - Current * (100 - Final Weight)) / Final Weight
  const requiredGrade = (targetGrade * 100 - currentGrade * (100 - finalWeight)) / finalWeight;

  let message = "";
  let isPossible = true;

  if (requiredGrade > 100) {
    message = `You need a score of ${requiredGrade.toFixed(2)}% on the final exam. Since this is over 100%, you will need extra credit to achieve your target.`;
  } else if (requiredGrade <= 0) {
    message = `You need a score of ${requiredGrade.toFixed(2)}% (or higher) on the final. You have already guaranteed your target grade even if you score a 0%!`;
  } else {
    message = `You need to score at least ${requiredGrade.toFixed(2)}% on your final exam to achieve a ${targetGrade}% overall.`;
  }

  return {
    requiredGrade,
    message,
    isPossible,
  };
}
