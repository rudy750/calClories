export type Sex = 'male' | 'female';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'extra_active';
export type GoalType = 'lose' | 'maintain' | 'gain';
export type MacroPreset = 'balanced' | 'high_protein' | 'low_carb' | 'custom';
export type UnitSystem = 'metric' | 'imperial';

export interface UserProfile {
  id: 1; // singleton
  name: string;
  sex: Sex;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  goalPaceKgPerWeek: number; // 0.25 | 0.5 | 0.75 | 1.0
  unitSystem: UnitSystem;
  macroPreset: MacroPreset;
  customProteinPct?: number;
  customCarbPct?: number;
  customFatPct?: number;
  onboardingComplete: boolean;
  createdAt: string; // ISO date
  updatedAt: string;
}

export interface CalorieTarget {
  calories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  tdeeEstimate: number;
  computedAt: string; // ISO date
  source: 'initial' | 'adaptive';
}

export interface FoodItem {
  id?: number;
  name: string;
  brand?: string;
  barcode?: string;
  calories: number; // per 100g
  proteinG: number;
  carbG: number;
  fatG: number;
  fiberG?: number;
  sodiumMg?: number;
  servingSizeG: number;
  servingSizeLabel: string; // e.g. "1 cup (240g)"
  source: 'openfoodfacts' | 'usda' | 'custom' | 'quick';
  sourceId?: string;
  lastUsed?: string; // ISO datetime for recents
  useCount?: number;
}

export interface MealEntry {
  id?: number;
  date: string; // YYYY-MM-DD
  mealSlot: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foodItemId?: number;
  foodName: string;
  amountG: number;
  calories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  loggedAt: string; // ISO datetime
  isQuickAdd: boolean;
}

export interface WeighIn {
  id?: number;
  date: string; // YYYY-MM-DD
  weightKg: number;
  loggedAt: string;
}

export interface DailySummary {
  date: string;
  totalCalories: number;
  totalProteinG: number;
  totalCarbG: number;
  totalFatG: number;
  targetCalories: number;
  targetProteinG: number;
  targetCarbG: number;
  targetFatG: number;
}

export interface NutritionSearchResult {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  calories: number;
  proteinG: number;
  carbG: number;
  fatG: number;
  servingSizeG: number;
  servingSizeLabel: string;
  source: 'openfoodfacts' | 'usda';
  sourceId: string;
}
