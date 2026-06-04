import { useMemo } from 'react';
import type { MealEntry } from '../../types';
import { Trash2, Plus } from 'lucide-react';

const SLOT_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const SLOT_LABELS: Record<string, string> = {
  breakfast: '🌅 Breakfast',
  lunch: '☀️ Lunch',
  dinner: '🌙 Dinner',
  snack: '⚡ Snacks',
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
    <div className="flex flex-col gap-3 mt-3">
      {SLOT_ORDER.map(slot => {
        const items = grouped.get(slot) ?? [];
        const total = items.reduce((s, m) => s + m.calories, 0);
        return (
          <div key={slot} className="rounded-2xl overflow-hidden" style={{ background: '#0F1525', border: '1px solid #1F2D50' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #1A2540' }}>
              <span className="font-semibold text-gray-200 text-sm">{SLOT_LABELS[slot]}</span>
              {total > 0 && (
                <span className="text-xs font-bold text-brand-500" style={{ textShadow: '0 0 6px rgba(0,217,126,0.4)' }}>
                  {total} kcal
                </span>
              )}
            </div>
            {items.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #0F1525' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-200 truncate">{m.foodName}</div>
                  <div className="text-xs text-gray-600">
                    {m.amountG}g · P {m.proteinG.toFixed(0)}g · C {m.carbG.toFixed(0)}g · F {m.fatG.toFixed(0)}g
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-sm font-bold text-gray-300">{m.calories} kcal</span>
                  <button
                    type="button"
                    onClick={() => m.id != null && onDelete(m.id)}
                    className="text-gray-700 hover:text-red-400 transition-colors p-1"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onAddToSlot(slot)}
              className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-brand-500 font-medium hover:bg-white/5 transition-colors"
            >
              <Plus size={15} />
              Add food
            </button>
          </div>
        );
      })}
    </div>
  );
}
