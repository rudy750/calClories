import { useState } from 'react';
import AppShell from '../components/layout/AppShell';
import { getWeighIns, addWeighIn, getMealsInRange, getLatestTarget, getProfile } from '../db/database';
import { daysAgo, format } from '../utils/date';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Scale, TrendingUp } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { estimateTDEE } from '../domain/adaptiveEngine';
import type { CalorieTarget } from '../types';
import { toDisplayWeight } from '../utils/units';

const TODAY = format(new Date());
const NINETY_DAYS_AGO = daysAgo(90);

export default function ProgressPage() {
  const qc = useQueryClient();
  const [newWeight, setNewWeight] = useState('');

  const { data: weighIns = [] } = useQuery({
    queryKey: ['weighIns'],
    queryFn: () => getWeighIns(NINETY_DAYS_AGO),
  });

  const { data: target } = useQuery<CalorieTarget & { id?: number } | undefined>({
    queryKey: ['target'],
    queryFn: getLatestTarget,
  });

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const { data: recentMeals = [] } = useQuery({
    queryKey: ['meals-range', daysAgo(28), TODAY],
    queryFn: () => getMealsInRange(daysAgo(28), TODAY),
  });

  const estimatedTDEE = estimateTDEE(weighIns, recentMeals);
  const unitSystem = profile?.unitSystem ?? 'metric';

  async function logWeight() {
    const raw = parseFloat(newWeight);
    if (!Number.isFinite(raw) || raw <= 0) return;

    const kg = unitSystem === 'metric' ? raw : raw / 2.2046226218;
    if (kg < 20 || kg > 500) return;

    await addWeighIn({ date: TODAY, weightKg: kg, loggedAt: new Date().toISOString() });
    setNewWeight('');
    qc.invalidateQueries({ queryKey: ['weighIns'] });
  }

  const chartData = weighIns.slice(-30).map(w => ({
    date: w.date.slice(5),
    weight: toDisplayWeight(w.weightKg, unitSystem),
  }));

  const latestWeight = weighIns.at(-1)?.weightKg;
  const firstWeight = weighIns.at(0)?.weightKg;
  const latestDisplay = latestWeight != null ? toDisplayWeight(latestWeight, unitSystem) : null;
  const firstDisplay = firstWeight != null ? toDisplayWeight(firstWeight, unitSystem) : null;
  const change = latestDisplay != null && firstDisplay != null
    ? (latestDisplay - firstDisplay).toFixed(1)
    : null;

  return (
    <AppShell title="Progress">
      <SectionCard icon={Scale} title="Log weight">
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            placeholder={unitSystem === 'metric' ? '75.0' : '165.0'}
            className="app-input flex-1 px-4 py-3 text-base"
          />
          <span className="app-subtle flex items-center px-1 text-sm font-medium">{unitSystem === 'metric' ? 'kg' : 'lb'}</span>
          <button
            type="button"
            onClick={logWeight}
            disabled={!newWeight}
            className="app-primary-button rounded-[var(--app-control-radius)] px-5 py-3 font-bold disabled:opacity-40"
          >
            Log
          </button>
        </div>
        {latestWeight != null && (
          <div className="app-muted mt-3 text-sm">
            Latest:{' '}
            <strong style={{ color: 'var(--app-brand-strong)' }}>
              {latestDisplay?.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lb'}
            </strong>
            {change !== null && (
              <span
                className="ml-2 font-semibold"
                style={{
                  color:
                    Number(change) < 0
                      ? '#10b981'
                      : Number(change) > 0
                        ? 'var(--app-danger)'
                        : 'var(--app-subtle)',
                }}
              >
                ({Number(change) > 0 ? '+' : ''}{change} {unitSystem === 'metric' ? 'kg' : 'lb'})
              </span>
            )}
          </div>
        )}
      </SectionCard>

      {chartData.length >= 2 && (
        <SectionCard icon={TrendingUp} title="Weight trend">
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-chart-grid)" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--app-subtle)' }} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: 'var(--app-subtle)' }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 16,
                  border: '1px solid var(--app-border)',
                  boxShadow: 'var(--app-tooltip-shadow)',
                  background: 'var(--app-tooltip-bg)',
                  color: 'var(--app-text)',
                }}
                formatter={(value) => {
                  const numeric = typeof value === 'number' ? value : Number(value ?? 0);
                  return [`${Number.isFinite(numeric) ? numeric : 0} ${unitSystem === 'metric' ? 'kg' : 'lb'}`, 'Weight'];
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="var(--app-brand)" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      )}

      {target && (
        <SectionCard icon={TrendingUp} title="Current targets">
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Calories" value={`${target.calories} kcal`} />
            <StatCard label="TDEE estimate" value={estimatedTDEE ? `${estimatedTDEE} kcal` : (target.tdeeEstimate ? `${target.tdeeEstimate} kcal` : '—')} />
            <StatCard label="Protein" value={`${target.proteinG}g`} />
            <StatCard label="Carbs" value={`${target.carbG}g`} />
            <StatCard label="Fat" value={`${target.fatG}g`} />
            <StatCard label="Source" value={target.source === 'adaptive' ? 'Adaptive' : 'Initial'} />
          </div>
          {weighIns.length < 7 && (
            <p className="app-subtle mt-3 text-xs">
              Log your weight for 7+ days to enable adaptive calorie adjustments.
            </p>
          )}
        </SectionCard>
      )}

      {weighIns.length === 0 && (
        <div className="mt-16 text-center">
          <div className="app-icon-pill mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[var(--app-card-radius)]">
            <Scale size={28} />
          </div>
          <p className="app-muted text-sm">Log your weight daily to track progress and enable adaptive targets.</p>
        </div>
      )}
    </AppShell>
  );
}

function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Scale;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="app-card mt-4 p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="app-icon-pill flex h-8 w-8 items-center justify-center">
          <Icon size={16} />
        </div>
        <span className="text-sm font-bold">{title}</span>
      </div>
      {children}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="app-card-soft p-3">
      <div className="app-subtle mb-1 text-xs">{label}</div>
      <div className="text-sm font-bold">{value}</div>
    </div>
  );
}
