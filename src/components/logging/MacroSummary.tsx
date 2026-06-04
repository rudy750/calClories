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

function Ring({ value, max, color, glowColor, size = 80 }: {
  value: number; max: number; color: string; glowColor: string; size?: number;
}) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / Math.max(max, 1), 1.05);
  const offset = circumference * (1 - progress);

  return (
    <svg width={size} height={size} className="rotate-[-90deg]" style={{ filter: `drop-shadow(0 0 6px ${glowColor})` }}>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#1A2540" strokeWidth={8} />
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

function MacroBar({ label, value, target, color, glowColor }: {
  label: string; value: number; target: number; color: string; glowColor: string;
}) {
  const pct = Math.min((value / Math.max(target, 1)) * 100, 100);
  return (
    <div className="flex-1">
      <div className="flex justify-between text-xs mb-1.5">
        <span className="font-medium text-gray-400">{label}</span>
        <span className="text-gray-500">{value.toFixed(0)}/{target}g</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#1A2540' }}>
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color, boxShadow: pct > 0 ? `0 0 8px ${glowColor}` : 'none' }}
        />
      </div>
    </div>
  );
}

export default function MacroSummary({ calories, targetCalories, proteinG, targetProteinG, carbG, targetCarbG, fatG, targetFatG }: Props) {
  const remaining = targetCalories - calories;
  const overBudget = remaining < 0;
  const ringColor = overBudget ? '#FF4D6D' : '#00D97E';
  const ringGlow = overBudget ? 'rgba(255,77,109,0.5)' : 'rgba(0,217,126,0.5)';

  return (
    <div className="rounded-2xl p-4 mt-4" style={{ background: '#0F1525', border: '1px solid #1F2D50' }}>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Ring value={calories} max={targetCalories} color={ringColor} glowColor={ringGlow} size={88} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-bold text-white leading-none">{calories}</span>
            <span className="text-[10px] text-gray-500">kcal</span>
          </div>
        </div>
        <div className="flex-1">
          <div className={`text-sm font-bold ${overBudget ? 'text-red-400' : 'text-brand-500'}`} style={overBudget ? {} : { textShadow: '0 0 8px rgba(0,217,126,0.4)' }}>
            {overBudget ? `${Math.abs(remaining)} over` : `${remaining} remaining`}
          </div>
          <div className="text-xs text-gray-600">Goal: {targetCalories} kcal</div>
        </div>
      </div>
      <div className="flex gap-4 mt-4">
        <MacroBar label="Protein" value={proteinG} target={targetProteinG} color="#4D9FFF" glowColor="rgba(77,159,255,0.4)" />
        <MacroBar label="Carbs" value={carbG} target={targetCarbG} color="#FFB347" glowColor="rgba(255,179,71,0.4)" />
        <MacroBar label="Fat" value={fatG} target={targetFatG} color="#FF7F7F" glowColor="rgba(255,127,127,0.4)" />
      </div>
    </div>
  );
}
