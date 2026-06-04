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

function Ring({ value, max, overBudget, size = 88 }: {
  value: number; max: number; overBudget: boolean; size?: number;
}) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / Math.max(max, 1), 1.05);
  const offset = circumference * (1 - progress);
  const color = overBudget ? '#ef4444' : '#f97316';

  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#f1f5f9" strokeWidth={10} />
      <circle
        cx={size / 2} cy={size / 2} r={radius} fill="none"
        stroke={color} strokeWidth={10}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
  );
}

function MacroBar({ label, value, target, color, textColor }: {
  label: string; value: number; target: number; color: string; textColor: string;
}) {
  const pct = Math.min((value / Math.max(target, 1)) * 100, 100);
  return (
    <div className="flex-1">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-xs font-black uppercase tracking-wide" style={{ color: '#64748b' }}>{label}</span>
        <span className="text-xs font-bold" style={{ color: textColor }}>{value.toFixed(0)}g</span>
      </div>
      <div className="h-2 bg-slate-100 rounded-sm overflow-hidden">
        <div
          className="h-full rounded-sm transition-all duration-500"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function MacroSummary({ calories, targetCalories, proteinG, targetProteinG, carbG, targetCarbG, fatG, targetFatG }: Props) {
  const remaining = targetCalories - calories;
  const overBudget = remaining < 0;

  return (
    <div className="mt-4 rounded-xl overflow-hidden" style={{ background: '#ffffff', border: '2px solid #0f172a', boxShadow: '4px 4px 0px #0f172a' }}>
      {/* Top accent bar */}
      <div className="h-1.5" style={{ background: overBudget ? '#ef4444' : 'linear-gradient(90deg, #f97316, #fbbf24)' }} />
      <div className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Ring value={calories} max={targetCalories} overBudget={overBudget} size={88} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-black leading-none" style={{ color: '#0f172a' }}>{calories}</span>
              <span className="text-[9px] font-bold uppercase tracking-wide mt-0.5" style={{ color: '#94a3b8' }}>kcal</span>
            </div>
          </div>
          <div className="flex-1">
            <div className={`text-lg font-black leading-tight ${overBudget ? 'text-red-500' : ''}`} style={overBudget ? {} : { color: '#f97316' }}>
              {overBudget ? `${Math.abs(remaining)} over!` : `${remaining} left`}
            </div>
            <div className="text-xs font-semibold mt-0.5" style={{ color: '#94a3b8' }}>of {targetCalories} kcal goal</div>
          </div>
        </div>
        <div className="flex gap-4 mt-4 pt-4" style={{ borderTop: '1.5px solid #f1f5f9' }}>
          <MacroBar label="Protein" value={proteinG} target={targetProteinG} color="#6366f1" textColor="#6366f1" />
          <MacroBar label="Carbs" value={carbG} target={targetCarbG} color="#f59e0b" textColor="#d97706" />
          <MacroBar label="Fat" value={fatG} target={targetFatG} color="#f97316" textColor="#ea580c" />
        </div>
      </div>
    </div>
  );
}
