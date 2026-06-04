import Dexie, { type Table } from 'dexie';
import type { UserProfile, FoodItem, MealEntry, WeighIn, CalorieTarget } from '../types';

class CaloriesDB extends Dexie {
  profile!: Table<UserProfile>;
  foods!: Table<FoodItem>;
  meals!: Table<MealEntry>;
  weighIns!: Table<WeighIn>;
  targets!: Table<CalorieTarget & { id?: number }>;

  constructor() {
    super('CaloriesDB');
    this.version(1).stores({
      profile: '&id',
      foods: '++id, barcode, source, lastUsed, useCount',
      meals: '++id, date, mealSlot, loggedAt',
      weighIns: '++id, &date',
      targets: '++id, computedAt',
    });
  }
}

export const db = new CaloriesDB();

export async function getProfile(): Promise<UserProfile | undefined> {
  return db.profile.get(1);
}

export async function saveProfile(profile: Omit<UserProfile, 'id'>): Promise<void> {
  await db.profile.put({ ...profile, id: 1 });
}

export async function getLatestTarget(): Promise<(CalorieTarget & { id?: number }) | undefined> {
  return db.targets.orderBy('computedAt').last();
}

export async function saveTarget(target: CalorieTarget): Promise<void> {
  await db.targets.add(target);
}

export async function getMealsForDate(date: string): Promise<MealEntry[]> {
  return db.meals.where('date').equals(date).toArray();
}

export async function addMeal(meal: Omit<MealEntry, 'id'>): Promise<number> {
  return db.meals.add(meal);
}

export async function deleteMeal(id: number): Promise<void> {
  await db.meals.delete(id);
}

export async function addWeighIn(entry: Omit<WeighIn, 'id'>): Promise<void> {
  await db.weighIns.put(entry);
}

export async function getWeighIns(since?: string): Promise<WeighIn[]> {
  let query = db.weighIns.orderBy('date');
  if (since) query = query.filter(w => w.date >= since);
  return query.toArray();
}

export async function upsertFood(food: Omit<FoodItem, 'id'>): Promise<number> {
  if (food.barcode) {
    const existing = await db.foods.where('barcode').equals(food.barcode).first();
    if (existing?.id) return existing.id;
  }
  return db.foods.add(food);
}

export async function getRecentFoods(limit = 20): Promise<FoodItem[]> {
  return db.foods
    .orderBy('lastUsed')
    .reverse()
    .filter(f => !!f.lastUsed)
    .limit(limit)
    .toArray();
}

export async function bumpFoodUsage(id: number): Promise<void> {
  await db.foods.update(id, {
    lastUsed: new Date().toISOString(),
    useCount: ((await db.foods.get(id))?.useCount ?? 0) + 1,
  });
}

export async function getMealsInRange(startDate: string, endDate: string): Promise<MealEntry[]> {
  return db.meals
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}
