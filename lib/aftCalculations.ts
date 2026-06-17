import {
  deadliftTable,
  pushupsTable,
  sdcTable,
  plankTable,
  runTable
} from "./aftData";

export interface AFTEventScores {
  deadlift: number;
  pushups: number;
  sdc: number;
  plank: number;
  run: number;
  total: number;
}

// Convert MM:SS into total seconds
export function parseTimeToSeconds(minutesStr: string, secondsStr: string): number {
  const min = parseInt(minutesStr, 10) || 0;
  const sec = parseInt(secondsStr, 10) || 0;
  return min * 60 + sec;
}

// Linear interpolation function:
// Returns the score interpolating between adjacent scoring tick marks
export function interpolate(h: number, k: number, d: number, D: number, E: number): number {
  if (k === D) return d;
  return d + ((h - k) * (E - d)) / (D - k);
}

// Main score calculation function for a single event
export function calculateEventScore(
  rawValue: number,
  event: "deadlift" | "pushups" | "sdc" | "plank" | "run",
  gender: "M" | "F",
  ageGroup: string
): number {
  if (!rawValue || rawValue <= 0) return 0;

  let table: Record<string, { M: Record<string, number>; F: Record<string, number> }>;

  switch (event) {
    case "deadlift":
      table = deadliftTable;
      break;
    case "pushups":
      table = pushupsTable;
      break;
    case "sdc":
      table = sdcTable;
      break;
    case "plank":
      table = plankTable;
      break;
    case "run":
      table = runTable;
      break;
    default:
      return 0;
  }

  const ageData = table[ageGroup];
  if (!ageData) return 0;

  const eventData = ageData[gender];
  if (!eventData) return 0;

  // Convert keys (scores) to numbers and sort descending
  const scores = Object.keys(eventData).map(Number).sort((a, b) => b - a);

  // SDC and Run are timed events where lower values are better
  const isTimed = event === "sdc" || event === "run";

  // Check for exact match
  for (const score of scores) {
    if (eventData[score.toString()] === rawValue) {
      return score;
    }
  }

  // Interpolate between bounds
  for (let i = 0; i < scores.length - 1; i++) {
    const higherScore = scores[i]; // e.g. 100
    const lowerScore = scores[i + 1]; // e.g. 99
    const rawForHigher = eventData[higherScore.toString()];
    const rawForLower = eventData[lowerScore.toString()];

    let inRange = false;
    if (isTimed) {
      // For timed, higherScore has LOWER raw time. lowerScore has HIGHER raw time.
      // So rawValue is between rawForHigher (lower bound time) and rawForLower (upper bound time)
      inRange = rawValue >= rawForHigher && rawValue <= rawForLower;
    } else {
      // For standard, higherScore has HIGHER raw value. lowerScore has LOWER raw value.
      // So rawValue is between rawForLower (lower bound reps) and rawForHigher (upper bound reps)
      inRange = rawValue >= rawForLower && rawValue <= rawForHigher;
    }

    if (inRange) {
      if (isTimed) {
        return Math.round(interpolate(rawValue, rawForHigher, higherScore, rawForLower, lowerScore));
      } else {
        return Math.round(interpolate(rawValue, rawForLower, lowerScore, rawForHigher, higherScore));
      }
    }
  }

  // Out of bounds handling
  const maxScore = Math.max(...scores);
  const minScore = Math.min(...scores);
  const rawForMax = eventData[maxScore.toString()];
  const rawForMin = eventData[minScore.toString()];

  if (isTimed) {
    if (rawValue <= rawForMax) return maxScore; // extremely fast time gets 100
    if (rawValue >= rawForMin) return minScore; // extremely slow time gets 0
  } else {
    if (rawValue >= rawForMax) return maxScore; // extremely high weight/reps/duration gets 100
    if (rawValue <= rawForMin) return minScore; // extremely low weight/reps/duration gets 0
  }

  return 0;
}
