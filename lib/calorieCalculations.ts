export type UnitSystem = "metric" | "imperial";
export type Gender = "male" | "female";
export type Formula = "mifflin" | "harris";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active" | "extra";

export interface CalorieCalculationParams {
  gender: Gender;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  activityLevel: ActivityLevel;
  formula: Formula;
}

export interface GoalCalorieProfile {
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  warning?: string;
  weeklyDiffLbs: number;
  weeklyDiffKgs: number;
}

export interface CalorieCalculationResult {
  bmr: number;
  tdee: number;
  goals: {
    maintain: GoalCalorieProfile;
    mildLoss: GoalCalorieProfile;
    loss: GoalCalorieProfile;
    extremeLoss: GoalCalorieProfile;
    mildGain: GoalCalorieProfile;
    gain: GoalCalorieProfile;
    fastGain: GoalCalorieProfile;
  };
}

export const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  extra: 1.9,
};

export const activityDescriptions: Record<ActivityLevel, string> = {
  sedentary: "Sedentary: little or no exercise, desk job",
  light: "Lightly Active: light exercise/sports 1-3 days/week",
  moderate: "Moderately Active: moderate exercise/sports 3-5 days/week",
  active: "Very Active: hard exercise/sports 6-7 days/week",
  extra: "Extra Active: very hard exercise/physical job or 2x training",
};

// Calculate macronutrient split (40% Carbs, 30% Protein, 30% Fats as a general default guide)
function calculateMacros(calories: number): { proteinGrams: number; carbGrams: number; fatGrams: number } {
  // Protein: 4 kcal per gram (30% of total calories)
  const proteinGrams = Math.round((calories * 0.30) / 4);
  // Carbs: 4 kcal per gram (40% of total calories)
  const carbGrams = Math.round((calories * 0.40) / 4);
  // Fats: 9 kcal per gram (30% of total calories)
  const fatGrams = Math.round((calories * 0.30) / 9);

  return { proteinGrams, carbGrams, fatGrams };
}

export function calculateCalorieNeeds(params: CalorieCalculationParams): CalorieCalculationResult {
  const { gender, age, height, weight, activityLevel, formula } = params;

  let bmr = 0;

  if (formula === "mifflin") {
    // Mifflin-St Jeor Equation
    if (gender === "male") {
      bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      bmr = 10 * weight + 6.25 * height - 5 * age - 161;
    }
  } else {
    // Revised Harris-Benedict Equation (1984, Roza and Shizgal)
    if (gender === "male") {
      bmr = 13.397 * weight + 4.799 * height - 5.677 * age + 88.362;
    } else {
      bmr = 9.247 * weight + 3.098 * height - 4.33 * age + 447.593;
    }
  }

  bmr = Math.round(bmr);
  const multiplier = activityMultipliers[activityLevel];
  const tdee = Math.round(bmr * multiplier);

  // Safety calorie floors: 1200 for women, 1500 for men
  const safetyFloor = gender === "female" ? 1200 : 1500;

  const createProfile = (
    cals: number,
    weeklyDiffLbs: number,
    weeklyDiffKgs: number,
    isLoss: boolean
  ): GoalCalorieProfile => {
    const finalCalories = Math.max(0, Math.round(cals));
    const macros = calculateMacros(finalCalories);
    let warning: string | undefined = undefined;

    if (isLoss && finalCalories < safetyFloor) {
      warning = `Warning: This caloric level is below the recommended safety minimum of ${safetyFloor} kcal/day for ${gender === "female" ? "females" : "males"}. Consult a physician before starting.`;
    }

    return {
      calories: finalCalories,
      ...macros,
      warning,
      weeklyDiffLbs,
      weeklyDiffKgs,
    };
  };

  return {
    bmr,
    tdee,
    goals: {
      maintain: createProfile(tdee, 0, 0, false),
      mildLoss: createProfile(tdee - 250, -0.5, -0.25, true),
      loss: createProfile(tdee - 500, -1, -0.5, true),
      extremeLoss: createProfile(tdee - 1000, -2, -0.9, true),
      mildGain: createProfile(tdee + 250, 0.5, 0.25, false),
      gain: createProfile(tdee + 500, 1, 0.5, false),
      fastGain: createProfile(tdee + 1000, 2, 0.9, false),
    },
  };
}
