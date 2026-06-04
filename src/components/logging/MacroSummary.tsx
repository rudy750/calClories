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

function Ring({ value, max, color, trackColor, size = 88 }: {
  value: number; max: number; color: string; trackColor: string; size?: number;
}) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / Math.max(max, 1), 1.05);
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={trackColor} strokeWidth={10} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-700"
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
      <div className="flex justify-between text-xs mb-2">
        <span className="font-semibold" style={{ color: '#6b5fa6' }}>{label}</span>
        <span style={{ color: '#a89fd4' }}>{value.toFixed(0)}g</span>
      </div>
      <div className="h-2 rounded-full overflow-hidden" style={{ background: '#f0ebff' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function MacroSummary({ calories, targetCalories, proteinG, targetProteinG, carbG, targetCarbG, fatG, targetFatG }: Props) {
  const remaining = targetCalories - calories;
  const overBudget = remaining < 0;
  const pct = Math.round(Math.min((calories / Math.max(targetCalories, 1)) * 100, 100));

  return (
    <div className="mt-4 p-5 rounded-3xl" style={{ background: 'linear-gradient(135deg, #f5f3ff 0%, #fdfaf5 100%)', border: '1px solid rgba(139,92,246,0.12)', boxShadow: '0 2px 20px rgba(139,92,246,0.08)' }}>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <Ring
            value={calories}
            max={targetCalories}
            color={overBudget ? '#f43f5e' : '#8b5cf6'}
            trackColor="#ede9fe"
            size={92}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none" style={{ color: '#1c1040' }}>{calories}</span>
            <span className="text-[9px] font-medium mt-0.5" style={{ color: '#a89fd4' }}>kcal</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className={`text-base font-bold mb-0.5 ${overBudget ? 'text-rose-500' : ''}`} style={overBudget ? {} : { color: '#7c3aed' }}>
            {overBudget ? `${Math.abs(remaining)} kcal over` : `${remaining} kcal left`}
          </div>
          <div className="text-xs mb-3" style={{ color: '#a89fd4' }}>Goal · {targetCalories} kcal</div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: '#ede9fe' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: overBudget ? '#f43f5e' : 'linear-gradient(90deg, #a78bfa, #7c3aed)' }} />
          </div>
        </div>
      </div>
      <div className="flex gap-4 mt-5">
        <MacroBar label="Protein" value={proteinG} target={targetProteinG} color="#6366f1" />
        <MacroBar label="Carbs" value={carbG} target={targetCarbG} color="#f59e0b" />
        <MacroBar label="Fat" value={fatG} target={targetFatG} color="#ec4899" />
      </div>
    </div>
  );
}
