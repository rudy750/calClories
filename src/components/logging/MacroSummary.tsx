interface Props {
  calories: number;
  targetCalories: number;
  proteinG: number;
  targetProteinG: number;
  carbG: number;
  targetCarbG: number;
  fatG: number;
  targetFatG: number;
}

function Ring({ value, max, color, size = 80 }: {
  value: number; max: number; color: string; size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / Math.max(max, 1), 1.05);
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f3f4f6" strokeWidth={8} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={8}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

function MacroBar({ label, value, target, color }: {
  label: string; value: number; target: number; color: string;
}) {
  const pct = Math.min((value / Math.max(target, 1)) * 100, 100);
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-600">{label}</span>
        <span className="text-gray-400">{value.toFixed(0)}/{target}g</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
}

export default function MacroSummary({ calories, targetCalories, proteinG, targetProteinG, carbG, targetCarbG, fatG, targetFatG }: Props) {
  const remaining = targetCalories - calories;
  const overBudget = remaining < 0;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mt-4">
      <div className="flex items-center gap-4">
        <div className="relative">
          <Ring value={calories} max={targetCalories} color={overBudget ? '#ef4444' : '#22c55e'} size={88} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-gray-900 leading-none">{calories}</span>
            <span className="text-[10px] text-gray-400">kcal</span>
          </div>
        </div>
        <div className="flex-1">
          <div className={`text-sm font-semibold ${overBudget ? 'text-red-500' : 'text-gray-700'}`}>
            {overBudget ? `${Math.abs(remaining)} over` : `${remaining} remaining`}
          </div>
          <div className="text-xs text-gray-400">Goal: {targetCalories} kcal</div>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <MacroBar label="Protein" value={proteinG} target={targetProteinG} color="#3b82f6" />
        <MacroBar label="Carbs" value={carbG} target={targetCarbG} color="#f59e0b" />
        <MacroBar label="Fat" value={fatG} target={targetFatG} color="#f97316" />
      </div>
    </div>
  );
}
