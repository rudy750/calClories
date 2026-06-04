import type { WeighIn, MealEntry, UserProfile, CalorieTarget } from '../types';
import { macroSplitFromPreset, applyMinimumSafety } from './macroEngine';

// Ordinary least squares linear regression: returns slope (kg/day)
export function linearRegressionSlope(points: { x: number; y: number }[]): number {
  if (points.length < 2) return 0;
  const n = points.length;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return 0;
  return (n * sumXY - sumX * sumY) / denom;
}

// Returns estimated TDEE from recent weight trend and calorie intake
export function estimateTDEE(
  weighIns: WeighIn[],
  meals: MealEntry[],
  minDays = 7,
): number | null {
  if (weighIns.length < 2 || meals.length === 0) return null;

  // Sort and take last 28 days
  const sorted = [...weighIns].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length < 2) return null;

  const startDate = sorted[0].date;
  const points = sorted.map(w => {
    const dayIndex = daysBetween(startDate, w.date);
    return { x: dayIndex, y: w.weightKg };
  });

  const slopeKgPerDay = linearRegressionSlope(points);

  // Average daily calories over the logged period
  const calsByDate = new Map<string, number>();
  for (const m of meals) {
    calsByDate.set(m.date, (calsByDate.get(m.date) ?? 0) + m.calories);
  }
  const dates = Array.from(calsByDate.keys()).sort();
  if (dates.length < minDays) return null;

  const avgCals = Array.from(calsByDate.values()).reduce((s, v) => s + v, 0) / calsByDate.size;

  // TDEE = avgCals - (weightChangeKgPerDay * 7700)
  return Math.round(avgCals - slopeKgPerDay * 7700);
}

function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000);
}

const MAX_WEEKLY_CHANGE = 150; // kcal — moderate mode

export function computeAdaptiveTarget(
  currentTarget: CalorieTarget,
  estimatedTDEE: number,
  profile: UserProfile,
): CalorieTarget {
  const goalAdjustment = profile.goalType === 'maintain'
    ? 0
    : (profile.goalPaceKgPerWeek * 7700 / 7) * (profile.goalType === 'gain' ? 1 : -1);

  const rawTarget = Math.round(estimatedTDEE + goalAdjustment);

  // Cap weekly adjustment at ±150 kcal (moderate)
  const delta = rawTarget - currentTarget.calories;
  const clampedDelta = Math.max(-MAX_WEEKLY_CHANGE, Math.min(MAX_WEEKLY_CHANGE, delta));
  let newCalories = currentTarget.calories + clampedDelta;

  newCalories = applyMinimumSafety(newCalories, profile.sex);

  const macros = macroSplitFromPreset(newCalories, profile.macroPreset, {
    proteinPct: profile.customProteinPct ?? 30,
    carbPct: profile.customCarbPct ?? 40,
    fatPct: profile.customFatPct ?? 30,
  });

  return {
    ...macros,
    calories: newCalories,
    tdeeEstimate: estimatedTDEE,
    computedAt: new Date().toISOString(),
    source: 'adaptive',
  };
}
