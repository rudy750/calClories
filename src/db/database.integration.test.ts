import {
  addMeal,
  bumpFoodUsage,
  db,
  getMealsForDate,
  getProfile,
  saveProfile,
  upsertFood,
} from './database';

describe('database integration', () => {
  beforeEach(async () => {
    await db.profile.clear();
    await db.foods.clear();
    await db.meals.clear();
    await db.weighIns.clear();
    await db.targets.clear();
  });

  it('saves and reads profile', async () => {
    await saveProfile({
      name: 'Test User',
      sex: 'male',
      age: 28,
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
    });

    const profile = await getProfile();
    expect(profile?.name).toBe('Test User');
    expect(profile?.id).toBe(1);
  });

  it('returns meals for requested date', async () => {
    await addMeal({
      date: '2026-06-04',
      mealSlot: 'lunch',
      foodName: 'Rice',
      amountG: 100,
      calories: 130,
      proteinG: 2.7,
      carbG: 28,
      fatG: 0.3,
      loggedAt: '2026-06-04T00:00:00.000Z',
      isQuickAdd: false,
    });

    await addMeal({
      date: '2026-06-05',
      mealSlot: 'lunch',
      foodName: 'Chicken',
      amountG: 100,
      calories: 165,
      proteinG: 31,
      carbG: 0,
      fatG: 3.6,
      loggedAt: '2026-06-05T00:00:00.000Z',
      isQuickAdd: false,
    });

    const meals = await getMealsForDate('2026-06-04');
    expect(meals).toHaveLength(1);
    expect(meals[0].foodName).toBe('Rice');
  });

  it('increments useCount when bumping food usage', async () => {
    const id = await upsertFood({
      name: 'Protein Bar',
      calories: 350,
      proteinG: 30,
      carbG: 25,
      fatG: 12,
      servingSizeG: 100,
      servingSizeLabel: '100g',
      source: 'custom',
      barcode: '111',
      useCount: 0,
    });

    await bumpFoodUsage(id);
    await bumpFoodUsage(id);

    const updated = await db.foods.get(id);
    expect(updated?.useCount).toBe(2);
    expect(updated?.lastUsed).toBeTruthy();
  });
});
