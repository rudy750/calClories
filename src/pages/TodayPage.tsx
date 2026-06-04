import { useState } from 'react';
import { format } from '../utils/date';
import { getMealsForDate, addMeal, deleteMeal, getLatestTarget } from '../db/database';
import type { MealEntry, CalorieTarget } from '../types';
import AppShell from '../components/layout/AppShell';
import MacroSummary from '../components/logging/MacroSummary';
import MealList from '../components/logging/MealList';
import FoodSearchModal from '../components/logging/FoodSearchModal';
import QuickAddModal from '../components/logging/QuickAddModal';
import { Plus } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const TODAY = format(new Date());

export default function TodayPage() {
  const qc = useQueryClient();
  const [activeSlot, setActiveSlot] = useState<MealEntry['mealSlot'] | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showQuickAdd, setShowQuickAdd] = useState(false);

  const { data: meals = [], refetch: refetchMeals } = useQuery({
    queryKey: ['meals', TODAY],
    queryFn: () => getMealsForDate(TODAY),
  });

  const { data: target } = useQuery<CalorieTarget & { id?: number } | undefined>({
    queryKey: ['target'],
    queryFn: getLatestTarget,
  });

  const totals = meals.reduce(
    (acc, m) => ({
      cal: acc.cal + m.calories,
      pro: acc.pro + m.proteinG,
      carb: acc.carb + m.carbG,
      fat: acc.fat + m.fatG,
    }),
    { cal: 0, pro: 0, carb: 0, fat: 0 },
  );

  async function handleSaveMeal(entry: Omit<MealEntry, 'id' | 'date' | 'loggedAt'>) {
    await addMeal({ ...entry, date: TODAY, loggedAt: new Date().toISOString() });
    setShowSearch(false);
    setShowQuickAdd(false);
    setActiveSlot(null);
    refetchMeals();
    qc.invalidateQueries({ queryKey: ['recents'] });
  }

  async function handleDelete(id: number) {
    await deleteMeal(id);
    refetchMeals();
  }

  function openAddForSlot(slot: MealEntry['mealSlot']) {
    setActiveSlot(slot);
    setShowSearch(true);
  }

  const t = target ?? { calories: 2000, proteinG: 150, carbG: 200, fatG: 67 };

  return (
    <AppShell title={`Today · ${formatDate(TODAY)}`}>
      <MacroSummary
        calories={Math.round(totals.cal)}
        targetCalories={t.calories}
        proteinG={totals.pro}
        targetProteinG={t.proteinG}
        carbG={totals.carb}
        targetCarbG={t.carbG}
        fatG={totals.fat}
        targetFatG={t.fatG}
      />

      <MealList
        meals={meals}
        onDelete={handleDelete}
        onAddToSlot={openAddForSlot}
      />

      {/* FAB */}
      <button
        type="button"
        onClick={() => { setActiveSlot('snack'); setShowSearch(true); }}
        className="fixed bottom-28 right-4 w-14 h-14 rounded-full text-white flex items-center justify-center z-30 transition-transform active:scale-95"
        style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)', boxShadow: '0 4px 20px rgba(124,58,237,0.35)' }}
      >
        <Plus size={26} />
      </button>

      {showSearch && (
        <FoodSearchModal
          slot={activeSlot ?? 'snack'}
          onSave={handleSaveMeal}
          onClose={() => { setShowSearch(false); setActiveSlot(null); }}
          onQuickAdd={() => { setShowSearch(false); setShowQuickAdd(true); }}
        />
      )}

      {showQuickAdd && (
        <QuickAddModal
          slot={activeSlot ?? 'snack'}
          onSave={handleSaveMeal}
          onClose={() => setShowQuickAdd(false)}
        />
      )}
    </AppShell>
  );
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
