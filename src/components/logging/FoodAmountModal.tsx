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
    <div className="app-screen fixed inset-0 z-50 flex flex-col">
      <div className="flex items-center gap-2 px-4 pt-4 pb-3" style={{ borderBottom: '1px solid var(--app-border)' }}>
        <button type="button" onClick={onBack} className="app-subtle p-1"><ArrowLeft size={22} /></button>
        <div className="flex-1 min-w-0">
          <div className="truncate font-semibold">{food.name}</div>
          {food.brand && <div className="app-subtle truncate text-xs">{food.brand}</div>}
        </div>
        <button type="button" onClick={onClose} className="app-subtle p-1"><X size={22} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">
        {/* Amount input */}
        <div>
          <label className="app-muted mb-2 block text-sm font-semibold">Amount</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={amountG}
              onChange={e => setAmountG(e.target.value)}
              className="app-input flex-1 px-4 py-3 text-xl font-semibold"
              autoFocus
            />
            <span className="app-subtle font-medium">g</span>
          </div>
          <div className="flex gap-2 mt-2">
            {PRESETS.map(p => (
              <button
                key={p.value}
                type="button"
                onClick={() => setAmountG(String(p.value))}
                className={`app-option flex-1 py-2 text-sm font-medium ${Number(amountG) === p.value ? 'app-option-active' : ''}`}
              >
                {p.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setAmountG(String(food.servingSizeG || 100))}
              className={`app-option flex-1 py-2 text-sm font-medium ${Number(amountG) === (food.servingSizeG || 100) ? 'app-option-active' : ''}`}
            >
              1 srv
            </button>
          </div>
        </div>

        {/* Nutrition preview */}
        <div className="app-card-soft p-4">
          <div className="mb-1 text-3xl font-bold">{cal} <span className="app-subtle text-base font-normal">kcal</span></div>
          <div className="app-muted flex gap-4 text-sm">
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
          className="app-primary-button w-full rounded-[var(--app-control-radius)] py-3.5 text-base font-semibold disabled:opacity-40"
        >
          Add to {slot}
        </button>
      </div>
    </div>
  );
}
