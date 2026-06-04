import { useState } from 'react';
import type { NutritionSearchResult, MealEntry } from '../../types';
import { ArrowLeft, X } from 'lucide-react';

interface Props {
  food: NutritionSearchResult;
  slot: MealEntry['mealSlot'];
  onSave: (entry: Omit<MealEntry, 'id' | 'date' | 'loggedAt'>) => void;
  onBack: () => void;
  onClose: () => void;
}

const PRESETS = [
  { label: '50g', value: 50 },
  { label: '100g', value: 100 },
  { label: '150g', value: 150 },
  { label: '200g', value: 200 },
];

export default function FoodAmountModal({ food, slot, onSave, onBack, onClose }: Props) {
  const defaultG = food.servingSizeG > 0 ? food.servingSizeG : 100;
  const [amountG, setAmountG] = useState(String(defaultG));

  const amount = Number(amountG) || 0;
  const factor = amount / 100;

  const cal = Math.round(food.calories * factor);
  const pro = (food.proteinG * factor).toFixed(1);
  const carb = (food.carbG * factor).toFixed(1);
  const fat = (food.fatG * factor).toFixed(1);

  function handleSave() {
    if (!amount) return;
    onSave({
      mealSlot: slot,
      foodName: food.brand ? `${food.name} (${food.brand})` : food.name,
      amountG: amount,
      calories: cal,
      proteinG: Number(pro),
      carbG: Number(carb),
      fatG: Number(fat),
      isQuickAdd: false,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3 border-b border-gray-100">
        <button type="button" onClick={onBack} className="text-gray-400 p-1"><ArrowLeft size={22} /></button>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-gray-900 truncate">{food.name}</div>
          {food.brand && <div className="text-xs text-gray-400 truncate">{food.brand}</div>}
        </div>
        <button type="button" onClick={onClose} className="text-gray-400 p-1"><X size={22} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
        {/* Amount input */}
        <div>
          <label className="block text-sm font-medium text-gray-600 mb-2">Amount</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={amountG}
              onChange={e => setAmountG(e.target.value)}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-gray-900 text-xl font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500"
              autoFocus
            />
            <span className="text-gray-500 font-medium">g</span>
          </div>
          <div className="flex gap-2 mt-2">
            {PRESETS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setAmountG(String(p.value))}
                className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  Number(amountG) === p.value
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-gray-200 text-gray-600'
                }`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmountG(String(food.servingSizeG || 100))}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                Number(amountG) === (food.servingSizeG || 100)
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-gray-200 text-gray-600'
              }`}
            >
              1 srv
            </button>
          </div>
        </div>

        {/* Nutrition preview */}
        <div className="bg-gray-50 rounded-2xl p-4">
          <div className="text-3xl font-bold text-gray-900 mb-1">{cal} <span className="text-base font-normal text-gray-400">kcal</span></div>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>P <strong>{pro}g</strong></span>
            <span>C <strong>{carb}g</strong></span>
            <span>F <strong>{fat}g</strong></span>
          </div>
        </div>
      </div>

      <div className="px-4 pb-8 pt-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!amount}
          className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-base disabled:opacity-40"
        >
          Add to {slot}
        </button>
      </div>
    </div>
  );
}
