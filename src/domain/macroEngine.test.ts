import {
  applyMinimumSafety,
  buildInitialTarget,
  computeBMR,
  computeGoalCalories,
  computeTDEE,
  macroSplitFromPreset,
} from './macroEngine';
import type { UserProfile } from '../types';

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

describe('macroEngine', () => {
  it('computes BMR for male profile', () => {
    const bmr = computeBMR(makeProfile());
    expect(bmr).toBe(1780);
  });

  it('computes BMR for female profile', () => {
    const bmr = computeBMR(makeProfile({ sex: 'female' }));
    expect(bmr).toBe(1614);
  });

  it('computes TDEE using activity multiplier', () => {
    const tdee = computeTDEE(makeProfile({ activityLevel: 'light' }));
    expect(tdee).toBeCloseTo(1780 * 1.375, 5);
  });

  it('computes goal calories for lose/maintain/gain', () => {
    const base = makeProfile();
    expect(computeGoalCalories(2500, { ...base, goalType: 'maintain' })).toBe(2500);
    expect(computeGoalCalories(2500, { ...base, goalType: 'lose', goalPaceKgPerWeek: 0.5 })).toBe(1950);
    expect(computeGoalCalories(2500, { ...base, goalType: 'gain', goalPaceKgPerWeek: 0.5 })).toBe(3050);
  });

  it('splits macros by preset', () => {
    expect(macroSplitFromPreset(2000, 'balanced')).toEqual({ proteinG: 150, carbG: 200, fatG: 67 });
    expect(macroSplitFromPreset(2000, 'high_protein')).toEqual({ proteinG: 175, carbG: 175, fatG: 67 });
    expect(macroSplitFromPreset(2000, 'low_carb')).toEqual({ proteinG: 150, carbG: 100, fatG: 111 });
  });

  it('supports custom macro split', () => {
    expect(
      macroSplitFromPreset(2000, 'custom', { proteinPct: 40, carbPct: 30, fatPct: 30 }),
    ).toEqual({ proteinG: 200, carbG: 150, fatG: 67 });
  });

  it('builds initial target from profile', () => {
    const result = buildInitialTarget(makeProfile());
    expect(result.source).toBe('initial');
    expect(result.calories).toBeGreaterThan(0);
    expect(result.tdeeEstimate).toBeGreaterThan(0);
    expect(result.proteinG + result.carbG + result.fatG).toBeGreaterThan(0);
  });

  it('applies safety minimum by sex', () => {
    expect(applyMinimumSafety(1000, 'male')).toBe(1500);
    expect(applyMinimumSafety(1000, 'female')).toBe(1200);
    expect(applyMinimumSafety(1800, 'male')).toBe(1800);
  });
});
