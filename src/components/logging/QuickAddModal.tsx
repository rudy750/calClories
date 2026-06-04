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
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl p-6 pb-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Zap size={18} className="text-brand-600" />
            <h2 className="text-lg font-bold text-gray-900">Quick Add</h2>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Label (optional)</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">Calories *</label>
            <input
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={e => setCalories(e.target.value)}
              placeholder="500"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
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
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wide">{label} g</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={val}
                  onChange={e => set(e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-3 rounded-xl border border-gray-200 text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!calories}
          className="w-full mt-5 py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-base disabled:opacity-40"
        >
          Add {calories ? `${calories} kcal` : ''}
        </button>
      </div>
    </div>
  );
}
