import { useTheme } from '../../context/ThemeContext';

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

function Ring({ value, max, color, size = 88 }: {
  value: number; max: number; color: string; size?: number;
}) {
  const radius = (size - 10) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / Math.max(max, 1), 1.05);
  const offset = circumference * (1 - progress);

  return (
    <svg
      width={size}
      height={size}
      className="rotate-[-90deg]"
      style={{ filter: 'drop-shadow(0 0 12px color-mix(in srgb, var(--app-brand) 38%, transparent))' }}
    >
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--app-ring-track)" strokeWidth={10} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth={10}
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
    <div className="flex-1 min-w-0">
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="font-semibold app-muted">{label}</span>
        <span className="app-subtle">{value.toFixed(0)}/{target}g</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--app-ring-track)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  );
}

export default function MacroSummary({
  calories,
  targetCalories,
  proteinG,
  targetProteinG,
  carbG,
  targetCarbG,
  fatG,
  targetFatG,
}: Props) {
  const { themeName } = useTheme();
  const remaining = targetCalories - calories;
  const overBudget = remaining < 0;
  const pct = Math.min((calories / Math.max(targetCalories, 1)) * 100, 100);
  const progressColor = overBudget
    ? 'var(--app-danger)'
    : themeName === 'minimal-wellness'
      ? 'linear-gradient(90deg, #a78bfa 0%, #7c3aed 100%)'
      : 'var(--app-brand-gradient)';
  const ringColor = overBudget ? 'var(--app-danger)' : 'var(--app-brand)';

  return (
    <div className="app-card mt-4 p-4">
      <div className="flex items-center gap-4">
        <div className="relative shrink-0">
          <Ring value={calories} max={targetCalories} color={ringColor} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-bold leading-none">{calories}</span>
            <span className="text-[10px] app-subtle">kcal</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <div
            className="mb-1 text-base font-bold"
            style={{ color: overBudget ? 'var(--app-danger)' : 'var(--app-brand-strong)' }}
          >
            {overBudget ? `${Math.abs(remaining)} kcal over` : `${remaining} kcal left`}
          </div>
          <div className="mb-3 text-xs app-subtle">Goal · {targetCalories} kcal</div>
          <div className="h-2 overflow-hidden rounded-full" style={{ background: 'var(--app-ring-track)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: progressColor }} />
          </div>
        </div>
      </div>

      <div className="mt-5 flex gap-4">
        <MacroBar label="Protein" value={proteinG} target={targetProteinG} color="#60a5fa" />
        <MacroBar label="Carbs" value={carbG} target={targetCarbG} color="#f59e0b" />
        <MacroBar label="Fat" value={fatG} target={targetFatG} color={themeName === 'minimal-wellness' ? '#ec4899' : '#fb7185'} />
      </div>
    </div>
  );
}
