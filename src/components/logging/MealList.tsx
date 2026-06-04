import { useMemo } from 'react';
import type { MealEntry } from '../../types';
import { Trash2, Plus } from 'lucide-react';

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
    <div className="flex flex-col gap-3 mt-3">
      {SLOT_ORDER.map(slot => {
        const items = grouped.get(slot) ?? [];
        const total = items.reduce((s, m) => s + m.calories, 0);
        return (
          <div key={slot} className="rounded-xl overflow-hidden bg-white" style={{ border: '2px solid #0f172a', boxShadow: '3px 3px 0px #0f172a' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: items.length > 0 ? '1.5px solid #f1f5f9' : 'none', background: '#f8f9fa' }}>
              <span className="font-black text-sm uppercase tracking-wide" style={{ color: '#0f172a' }}>
                {SLOT_LABELS[slot]}
              </span>
              {total > 0 && (
                <span className="text-xs font-black px-2 py-0.5 rounded" style={{ background: '#f97316', color: '#ffffff' }}>
                  {total} kcal
                </span>
              )}
            </div>
            {items.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid #f8f9fa' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate" style={{ color: '#0f172a' }}>{m.foodName}</div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: '#94a3b8' }}>
                    {m.amountG}g · P {m.proteinG.toFixed(0)}g · C {m.carbG.toFixed(0)}g · F {m.fatG.toFixed(0)}g
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-sm font-black" style={{ color: '#f97316' }}>{m.calories}</span>
                  <button
                    type="button"
                    onClick={() => m.id != null && onDelete(m.id)}
                    className="p-1 transition-colors hover:text-red-500"
                    style={{ color: '#cbd5e1' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onAddToSlot(slot)}
              className="w-full px-4 py-2.5 flex items-center gap-2 text-xs font-black uppercase tracking-wide transition-colors hover:bg-orange-50"
              style={{ color: '#f97316' }}
            >
              <Plus size={14} strokeWidth={3} />
              Add food
            </button>
          </div>
        );
      })}
    </div>
  );
}
