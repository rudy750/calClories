import { computeAdaptiveTarget, estimateTDEE, linearRegressionSlope } from './adaptiveEngine';
import type { CalorieTarget, MealEntry, UserProfile, WeighIn } from '../types';

function makeProfile(overrides: Partial<UserProfile> = {}): UserProfile {
  return {
    id: 1,
    name: 'Test',
    sex: 'male',
    age: 30,
    heightCm: 180,
    weightKg: 80,
    activityLevel: 'moderate',
    goalType: 'maintain',
    goalPaceKgPerWeek: 0.5,
    unitSystem: 'metric',
    macroPreset: 'balanced',
    onboardingComplete: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

function makeTarget(overrides: Partial<CalorieTarget> = {}): CalorieTarget {
  return {
    calories: 2500,
    proteinG: 188,
    carbG: 250,
    fatG: 83,
    tdeeEstimate: 2500,
    computedAt: '2026-01-01T00:00:00.000Z',
    source: 'initial',
    ...overrides,
  };
}

describe('adaptiveEngine', () => {
  it('returns zero slope for insufficient points', () => {
    expect(linearRegressionSlope([{ x: 0, y: 80 }])).toBe(0);
  });

  it('computes linear regression slope', () => {
    const slope = linearRegressionSlope([
      { x: 0, y: 80 },
      { x: 1, y: 79.9 },
      { x: 2, y: 79.8 },
      { x: 3, y: 79.7 },
    ]);
    expect(slope).toBeCloseTo(-0.1, 4);
  });

  it('returns null TDEE when not enough data', () => {
    expect(estimateTDEE([], [])).toBeNull();
    expect(
      estimateTDEE(
        [{ date: '2026-01-01', weightKg: 80, loggedAt: '2026-01-01T00:00:00.000Z' }],
        [],
      ),
    ).toBeNull();
  });

  it('estimates TDEE from trend and calories', () => {
    const weighIns: WeighIn[] = [
      { date: '2026-01-01', weightKg: 80, loggedAt: '2026-01-01T00:00:00.000Z' },
      { date: '2026-01-08', weightKg: 79.3, loggedAt: '2026-01-08T00:00:00.000Z' },
    ];

    const meals: MealEntry[] = Array.from({ length: 8 }).map((_, i) => ({
      id: i + 1,
      date: `2026-01-0${i + 1}`,
      mealSlot: 'lunch',
      foodName: 'Meal',
      amountG: 100,
      calories: 2200,
      proteinG: 100,
      carbG: 200,
      fatG: 70,
      loggedAt: '2026-01-01T00:00:00.000Z',
      isQuickAdd: false,
    }));

    const result = estimateTDEE(weighIns, meals, 7);
    expect(result).toBe(2970);
  });

  it('clamps adaptive calorie adjustment to 150 kcal', () => {
    const next = computeAdaptiveTarget(
      makeTarget({ calories: 2500 }),
      3200,
      makeProfile({ goalType: 'maintain' }),
    );
    expect(next.calories).toBe(2650);
    expect(next.source).toBe('adaptive');
  });

  it('respects minimum safety threshold', () => {
    const next = computeAdaptiveTarget(
      makeTarget({ calories: 1300 }),
      1000,
      makeProfile({ sex: 'female', goalType: 'lose' }),
    );
    expect(next.calories).toBe(1200);
  });
});
