import { useMemo } from 'react';
import type { MealEntry } from '../../types';
import { Trash2, Plus } from 'lucide-react';
import { useTheme } from '../../context/useTheme';

const SLOT_ORDER = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

const SLOT_META: Record<
  MealEntry['mealSlot'],
  {
    label: string;
    darkIcon: string;
    minimalIcon: string;
    darkBg: string;
    minimalBg: string;
  }
> = {
  breakfast: { label: 'Breakfast', darkIcon: '🌅', minimalIcon: '🌸', darkBg: 'rgba(0, 217, 126, 0.12)', minimalBg: '#fdf2f8' },
  lunch: { label: 'Lunch', darkIcon: '☀️', minimalIcon: '🌿', darkBg: 'rgba(34, 197, 94, 0.12)', minimalBg: '#f0fdf4' },
  dinner: { label: 'Dinner', darkIcon: '🌙', minimalIcon: '🫐', darkBg: 'rgba(96, 165, 250, 0.12)', minimalBg: '#eff6ff' },
  snack: { label: 'Snacks', darkIcon: '⚡', minimalIcon: '✨', darkBg: 'rgba(251, 113, 133, 0.12)', minimalBg: '#fdf2f8' },
};

interface Props {
  meals: MealEntry[];
  onDelete: (id: number) => void;
  onAddToSlot: (slot: MealEntry['mealSlot']) => void;
}

export default function MealList({ meals, onDelete, onAddToSlot }: Props) {
  const { themeName } = useTheme();
  const grouped = useMemo(() => {
    const map = new Map<string, MealEntry[]>();
    for (const slot of SLOT_ORDER) map.set(slot, []);
    for (const m of meals) {
      map.get(m.mealSlot)?.push(m);
    }
    return map;
  }, [meals]);

  return (
    <div className="mt-2 flex flex-col gap-4">
      {SLOT_ORDER.map(slot => {
        const items = grouped.get(slot) ?? [];
        const total = items.reduce((s, m) => s + m.calories, 0);
        const meta = SLOT_META[slot];
        const slotBg = themeName === 'minimal-wellness' ? meta.minimalBg : meta.darkBg;
        const slotIcon = themeName === 'minimal-wellness' ? meta.minimalIcon : meta.darkIcon;

        return (
          <div key={slot} className="app-card overflow-hidden">
            <div
              className="flex items-center justify-between px-4 py-3.5"
              style={{ background: slotBg, borderBottom: items.length > 0 ? '1px solid var(--app-border)' : 'none' }}
            >
              <span className="flex items-center gap-2 text-sm font-bold">
                <span aria-hidden="true">{slotIcon}</span>
                <span>{meta.label}</span>
              </span>
              {total > 0 && (
                <span className="app-chip rounded-full px-2.5 py-1 text-xs font-semibold">
                  {total} kcal
                </span>
              )}
            </div>

            {items.map(m => (
              <div
                key={m.id}
                className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: '1px solid var(--app-border)' }}
              >
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{m.foodName}</div>
                  <div className="app-subtle mt-0.5 text-xs">
                    {m.amountG}g · P {m.proteinG.toFixed(0)}g · C {m.carbG.toFixed(0)}g · F {m.fatG.toFixed(0)}g
                  </div>
                </div>
                <div className="ml-2 flex items-center gap-3">
                  <span className="text-sm font-bold" style={{ color: 'var(--app-brand-strong)' }}>
                    {m.calories} kcal
                  </span>
                  <button
                    type="button"
                    onClick={() => m.id != null && onDelete(m.id)}
                    className="rounded-xl p-1.5 transition-colors"
                    style={{ color: 'var(--app-subtle)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={() => onAddToSlot(slot)}
              aria-label="+ Add food"
              className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-semibold transition-colors"
              style={{ color: 'var(--app-brand-strong)' }}
            >
              <span className="app-icon-pill flex h-5 w-5 items-center justify-center rounded-full">
                <Plus size={12} />
              </span>
              + Add food
            </button>
          </div>
        );
      })}
    </div>
  );
}
