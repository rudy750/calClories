import { useState } from 'react';
import type { MealEntry } from '../../types';
import { X, Zap } from 'lucide-react';

interface Props {
  slot: MealEntry['mealSlot'];
  onSave: (entry: Omit<MealEntry, 'id' | 'date' | 'loggedAt'>) => void;
  onClose: () => void;
}

export default function QuickAddModal({ slot, onSave, onClose }: Props) {
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carb, setCarb] = useState('');
  const [fat, setFat] = useState('');
  const [name, setName] = useState('Quick add');

  function handleSave() {
    const cal = Number(calories);
    if (!cal) return;
    onSave({
      mealSlot: slot,
      foodName: name || 'Quick add',
      amountG: 0,
      calories: cal,
      proteinG: Number(protein) || 0,
      carbG: Number(carb) || 0,
      fatG: Number(fat) || 0,
      isQuickAdd: true,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
      <div className="app-card w-full max-w-lg !rounded-b-none !rounded-t-3xl p-6 pb-8 sm:!rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="app-icon-pill flex h-8 w-8 items-center justify-center">
              <Zap size={16} />
            </div>
            <h2 className="text-lg font-bold">Quick Add</h2>
          </div>
          <button type="button" onClick={onClose} className="app-subtle p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="app-subtle mb-1 block text-xs font-medium uppercase tracking-wide">Label (optional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="app-input w-full px-4 py-3"
            />
          </div>
          <div>
            <label className="app-subtle mb-1 block text-xs font-medium uppercase tracking-wide">Calories *</label>
            <input
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              placeholder="500"
              className="app-input w-full px-4 py-3 text-xl font-semibold"
              autoFocus
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Protein', val: protein, set: setProtein },
              { label: 'Carbs', val: carb, set: setCarb },
              { label: 'Fat', val: fat, set: setFat },
            ].map(({ label, val, set }) => (
              <div key={label}>
                <label className="app-subtle mb-1 block text-xs font-medium uppercase tracking-wide">{label} g</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder="0"
                  className="app-input w-full px-3 py-3"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!calories}
          className="app-primary-button mt-5 w-full rounded-[var(--app-control-radius)] py-3.5 text-base font-semibold disabled:opacity-40"
        >
          Add {calories ? `${calories} kcal` : ''}
        </button>
      </div>
    </div>
  );
}
