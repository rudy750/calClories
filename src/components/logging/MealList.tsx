import { useMemo } from 'react';
import type { MealEntry } from '../../types';
import { Trash2 } from 'lucide-react';

const SLOT_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const SLOT_LABELS: Record<string, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snacks',
};

interface Props {
  meals: MealEntry[];
  onDelete: (id: number) => void;
  onAddToSlot: (slot: MealEntry['mealSlot']) => void;
}

export default function MealList({ meals, onDelete, onAddToSlot }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, MealEntry[]>();
    for (const slot of SLOT_ORDER) map.set(slot, []);
    for (const m of meals) {
      map.get(m.mealSlot)?.push(m);
    }
    return map;
  }, [meals]);

  return (
    <div className="flex flex-col gap-4 mt-2">
      {SLOT_ORDER.map(slot => {
        const items = grouped.get(slot) ?? [];
        const total = items.reduce((s, m) => s + m.calories, 0);
        return (
          <div key={slot} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <span className="font-semibold text-gray-800">{SLOT_LABELS[slot]}</span>
              <span className="text-sm text-gray-400">{total > 0 ? `${total} kcal` : ''}</span>
            </div>
            {items.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">{m.foodName}</div>
                  <div className="text-xs text-gray-400">
                    {m.amountG}g · P {m.proteinG.toFixed(0)}g · C {m.carbG.toFixed(0)}g · F {m.fatG.toFixed(0)}g
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-sm font-semibold text-gray-700">{m.calories} kcal</span>
                  <button
                    type="button"
                    onClick={() => m.id != null && onDelete(m.id)}
                    className="text-gray-300 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onAddToSlot(slot)}
              className="w-full px-4 py-2.5 text-sm text-brand-600 font-medium text-left hover:bg-gray-50 transition-colors"
            >
              + Add food
            </button>
          </div>
        );
      })}
    </div>
  );
}
