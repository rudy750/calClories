import { useState, useCallback } from 'react';
import { searchFood, lookupBarcode } from '../../services/nutritionService';
import { getRecentFoods } from '../../db/database';
import type { NutritionSearchResult, FoodItem, MealEntry } from '../../types';
import { Search, X, Loader2, Camera, History } from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import FoodAmountModal from './FoodAmountModal';
import { useQuery } from '@tanstack/react-query';

interface Props {
  slot: MealEntry['mealSlot'];
  onSave: (entry: Omit<MealEntry, 'id' | 'date' | 'loggedAt'>) => void;
  onClose: () => void;
  onQuickAdd: () => void;
}

export default function FoodSearchModal({ slot, onSave, onClose, onQuickAdd }: Props) {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<NutritionSearchResult[]>([]);
  const [selected, setSelected] = useState<NutritionSearchResult | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [barcodeLookingUp, setBarcodeLookingUp] = useState(false);
  const [barcodeError, setBarcodeError] = useState('');

  const { data: recents = [] } = useQuery({
    queryKey: ['recents'],
    queryFn: () => getRecentFoods(10),
  });

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setSearching(true);
    const res = await searchFood(q);
    setResults(res);
    setSearching(false);
  }, []);

  function handleInput(value: string) {
    setQuery(value);
    if (value.length >= 2) doSearch(value);
    else setResults([]);
  }

  async function handleBarcode(barcode: string) {
    setShowScanner(false);
    setBarcodeLookingUp(true);
    setBarcodeError('');
    const result = await lookupBarcode(barcode);
    setBarcodeLookingUp(false);
    if (result) {
      setSelected(result);
    } else {
      setBarcodeError(`No product found for barcode ${barcode}. Try searching by name.`);
    }
  }

  function recentToResult(food: FoodItem): NutritionSearchResult {
    return {
      id: `food-${food.id}`,
      name: food.name,
      brand: food.brand,
      barcode: food.barcode,
      calories: food.calories,
      proteinG: food.proteinG,
      carbG: food.carbG,
      fatG: food.fatG,
      servingSizeG: food.servingSizeG,
      servingSizeLabel: food.servingSizeLabel,
      source: food.source as 'openfoodfacts' | 'usda',
      sourceId: food.sourceId ?? '',
    };
  }

  if (showScanner) {
    return <BarcodeScanner onDetected={handleBarcode} onClose={() => setShowScanner(false)} />;
  }

  if (selected) {
    return (
      <FoodAmountModal
        food={selected}
        slot={slot}
        onSave={onSave}
        onBack={() => setSelected(null)}
        onClose={onClose}
      />
    );
  }

  const showRecents = !query && recents.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2 border-b border-gray-100">
        <button type="button" onClick={onClose} className="text-gray-400 p-1"><X size={22} /></button>
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => handleInput(e.target.value)}
            placeholder="Search foods…"
            autoFocus
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-100 text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          {searching && <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />}
        </div>
        <button
          type="button"
          onClick={() => setShowScanner(true)}
          className="p-2 text-brand-600 hover:bg-brand-50 rounded-xl transition-colors"
        >
          <Camera size={22} />
        </button>
      </div>

      {/* Quick add shortcut */}
      <div className="px-4 pt-3">
        <button
          type="button"
          onClick={onQuickAdd}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-brand-600 font-medium text-sm hover:bg-brand-50 transition-colors"
        >
          ⚡ Quick add calories
        </button>
      </div>

      {barcodeError && (
        <div className="mx-4 mt-3 p-3 bg-red-50 text-red-700 rounded-xl text-sm">{barcodeError}</div>
      )}

      {barcodeLookingUp && (
        <div className="flex items-center justify-center gap-2 mt-8 text-gray-500">
          <Loader2 size={20} className="animate-spin" />
          Looking up barcode…
        </div>
      )}

      {/* Results / Recents */}
      <div className="flex-1 overflow-y-auto">
        {showRecents && (
          <div className="px-4 pt-4">
            <div className="flex items-center gap-1.5 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
              <History size={13} /> Recent
            </div>
            {recents.map(food => (
              <FoodRow key={food.id} result={recentToResult(food)} onSelect={setSelected} />
            ))}
          </div>
        )}

        {results.length > 0 && (
          <div className="px-4 pt-4">
            {results.map(r => <FoodRow key={r.id} result={r} onSelect={setSelected} />)}
          </div>
        )}

        {query.length >= 2 && !searching && results.length === 0 && (
          <div className="text-center mt-12 text-gray-400 text-sm">No results for "{query}"</div>
        )}
      </div>

      {/* Attribution */}
      <div className="px-4 py-3 text-center text-[10px] text-gray-300">
        Data from Open Food Facts (CC BY-SA) &amp; USDA FoodData Central
      </div>
    </div>
  );
}

function FoodRow({ result, onSelect }: { result: NutritionSearchResult; onSelect: (r: NutritionSearchResult) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className="w-full flex items-center justify-between py-3 border-b border-gray-50 last:border-0 text-left hover:bg-gray-50 rounded-lg px-2 -mx-2 transition-colors"
    >
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{result.name}</div>
        {result.brand && <div className="text-xs text-gray-400 truncate">{result.brand}</div>}
      </div>
      <div className="text-right ml-3 shrink-0">
        <div className="text-sm font-semibold text-gray-700">{Math.round(result.calories)} kcal</div>
        <div className="text-[10px] text-gray-400">per 100g</div>
      </div>
    </button>
  );
}
