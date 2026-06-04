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
      <div className="rounded-2xl p-4 mt-4" style={{ background: '#0F1525', border: '1px solid #1F2D50' }}>
        <div className="flex items-center gap-2 mb-3">
          <Scale size={18} className="text-brand-500" />
          <span className="font-semibold text-gray-200">Log weight</span>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            placeholder={unitSystem === 'metric' ? '75.0' : '165.0'}
            className="flex-1 px-4 py-2.5 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 text-white"
            style={{ background: '#141D30', border: '1px solid #1F2D50' }}
          />
          <span className="flex items-center text-gray-500 text-sm">{unitSystem === 'metric' ? 'kg' : 'lb'}</span>
          <button
            type="button"
            onClick={logWeight}
            disabled={!newWeight}
            className="px-5 py-2.5 rounded-xl text-white font-semibold disabled:opacity-40 transition-all"
            style={{ background: '#00B368', boxShadow: '0 0 12px rgba(0,217,126,0.3)' }}
          >
            Log
          </button>
        </div>
        {latestWeight != null && (
          <div className="mt-2 text-sm text-gray-500">
            Latest: <strong className="text-gray-200">{latestDisplay?.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lb'}</strong>
            {change !== null && (
              <span className={`ml-2 font-medium ${Number(change) < 0 ? 'text-brand-500' : Number(change) > 0 ? 'text-red-400' : 'text-gray-500'}`}>
                ({Number(change) > 0 ? '+' : ''}{change} {unitSystem === 'metric' ? 'kg' : 'lb'} from start)
              </span>
            )}
          </div>
        )}
      </div>

      {chartData.length >= 2 && (
        <div className="rounded-2xl p-4 mt-4" style={{ background: '#0F1525', border: '1px solid #1F2D50' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={18} className="text-brand-500" />
            <span className="font-semibold text-gray-200">Weight trend (last 30 entries)</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1A2540" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6b7280' }} tickLine={false} />
              <YAxis
                domain={['auto', 'auto']}
                tick={{ fontSize: 10, fill: '#6b7280' }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.5)', background: '#141D30', color: '#F0F4FF' }}
                formatter={(value) => {
                  const numeric = typeof value === 'number' ? value : Number(value ?? 0);
                  return [`${Number.isFinite(numeric) ? numeric : 0} ${unitSystem === 'metric' ? 'kg' : 'lb'}`, 'Weight'];
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="#00D97E" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {target && (
        <div className="rounded-2xl p-4 mt-4" style={{ background: '#0F1525', border: '1px solid #1F2D50' }}>
          <div className="font-semibold text-gray-200 mb-3">Current targets</div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Calories" value={`${target.calories} kcal`} />
            <StatCard label="TDEE estimate" value={estimatedTDEE ? `${estimatedTDEE} kcal` : (target.tdeeEstimate ? `${target.tdeeEstimate} kcal` : '—')} />
            <StatCard label="Protein" value={`${target.proteinG}g`} />
            <StatCard label="Carbs" value={`${target.carbG}g`} />
            <StatCard label="Fat" value={`${target.fatG}g`} />
            <StatCard label="Source" value={target.source === 'adaptive' ? 'Adaptive' : 'Initial'} />
          </div>
          {weighIns.length < 7 && (
            <p className="text-xs text-gray-500 mt-3">
              Log your weight for 7+ days to enable adaptive calorie adjustments.
            </p>
          )}
        </div>
      )}

      {weighIns.length === 0 && (
        <div className="text-center mt-12 text-gray-500">
          <Scale size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Log your weight daily to track progress and enable adaptive targets.</p>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: '#141D30' }}>
      <div className="text-xs text-gray-600 mb-0.5">{label}</div>
      <div className="text-base font-semibold text-gray-200">{value}</div>
    </div>
  );
}
