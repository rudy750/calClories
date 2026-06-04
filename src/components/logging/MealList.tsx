import { useMemo } from 'react';
import type { MealEntry } from '../../types';
import { Trash2, Plus } from 'lucide-react';

const SLOT_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;
const SLOT_META: Record<string, { label: string; emoji: string; color: string }> = {
  breakfast: { label: 'Breakfast', emoji: '🌸', color: '#fdf4ff' },
  lunch:     { label: 'Lunch',     emoji: '🌿', color: '#f0fdf4' },
  dinner:    { label: 'Dinner',    emoji: '🫐', color: '#eff6ff' },
  snack:     { label: 'Snacks',    emoji: '✨', color: '#fdf2f8' },
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
        const meta = SLOT_META[slot];
        return (
          <div key={slot} className="rounded-3xl overflow-hidden" style={{ background: '#ffffff', boxShadow: '0 1px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
            <div className="flex items-center justify-between px-4 py-3.5" style={{ background: meta.color, borderBottom: items.length > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}>
              <span className="font-bold text-sm" style={{ color: '#1c1040' }}>
                {meta.emoji} {meta.label}
              </span>
              {total > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'rgba(139,92,246,0.12)', color: '#7c3aed' }}>
                  {total} kcal
                </span>
              )}
            </div>
            {items.map(m => (
              <div key={m.id} className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid #faf5ff' }}>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate" style={{ color: '#1c1040' }}>{m.foodName}</div>
                  <div className="text-xs mt-0.5" style={{ color: '#a89fd4' }}>
                    {m.amountG}g · P {m.proteinG.toFixed(0)}g · C {m.carbG.toFixed(0)}g · F {m.fatG.toFixed(0)}g
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-2">
                  <span className="text-sm font-bold" style={{ color: '#7c3aed' }}>{m.calories}</span>
                  <button
                    type="button"
                    onClick={() => m.id != null && onDelete(m.id)}
                    className="p-1.5 rounded-xl transition-colors hover:bg-rose-50"
                    style={{ color: '#d4c8f0' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => onAddToSlot(slot)}
              className="w-full px-4 py-3 flex items-center gap-2 text-sm font-semibold transition-colors"
              style={{ color: '#8b5cf6' }}
            >
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#ede9fe' }}>
                <Plus size={12} />
              </div>
              Add food
            </button>
          </div>
        );
      })}
    </div>
  );
}
