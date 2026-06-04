import type { UserProfile, CalorieTarget, ActivityLevel, MacroPreset } from '../types';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export function computeBMR(profile: UserProfile): number {
  // Mifflin-St Jeor
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  return profile.sex === 'male' ? base + 5 : base - 161;
}

export function computeTDEE(profile: UserProfile): number {
  return computeBMR(profile) * ACTIVITY_MULTIPLIERS[profile.activityLevel];
}

export function computeGoalCalories(tdee: number, profile: UserProfile): number {
  const cal = tdee + profile.goalPaceKgPerWeek * 7700 / 7 * (profile.goalType === 'gain' ? 1 : -1);
  if (profile.goalType === 'maintain') return Math.round(tdee);
  return Math.round(cal);
}

export function macroSplitFromPreset(
  calories: number,
  preset: MacroPreset,
  custom?: { proteinPct: number; carbPct: number; fatPct: number },
): { proteinG: number; carbG: number; fatG: number } {
  let pPct: number, cPct: number, fPct: number;

  switch (preset) {
    case 'high_protein': pPct = 0.35; cPct = 0.35; fPct = 0.30; break;
    case 'low_carb':     pPct = 0.30; cPct = 0.20; fPct = 0.50; break;
    case 'custom':
      pPct = (custom?.proteinPct ?? 30) / 100;
      cPct = (custom?.carbPct ?? 40) / 100;
      fPct = (custom?.fatPct ?? 30) / 100;
      break;
    default: pPct = 0.30; cPct = 0.40; fPct = 0.30; // balanced
  }

  return {
    proteinG: Math.round((calories * pPct) / 4),
    carbG: Math.round((calories * cPct) / 4),
    fatG: Math.round((calories * fPct) / 9),
  };
}

export function buildInitialTarget(profile: UserProfile): CalorieTarget {
  const tdee = computeTDEE(profile);
  const calories = computeGoalCalories(tdee, profile);
  const macros = macroSplitFromPreset(calories, profile.macroPreset, {
    proteinPct: profile.customProteinPct ?? 30,
    carbPct: profile.customCarbPct ?? 40,
    fatPct: profile.customFatPct ?? 30,
  });

  return {
    ...macros,
    calories,
    tdeeEstimate: Math.round(tdee),
    computedAt: new Date().toISOString(),
    source: 'initial',
  };
}

export function applyMinimumSafety(calories: number, sex: 'male' | 'female'): number {
  const min = sex === 'male' ? 1500 : 1200;
  return Math.max(calories, min);
}
