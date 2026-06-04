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
    date: w.date.slice(5), // MM-DD
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
      {/* Log weight */}
      <div className="rounded-xl mt-4 bg-white overflow-hidden" style={{ border: '2px solid #0f172a', boxShadow: '3px 3px 0px #0f172a' }}>
        <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1.5px solid #f1f5f9', background: '#f8f9fa' }}>
          <Scale size={16} style={{ color: '#f97316' }} />
          <span className="font-black text-sm uppercase tracking-wide" style={{ color: '#0f172a' }}>Log weight</span>
        </div>
        <div className="p-4">
          <div className="flex gap-2">
            <input
              type="number"
              inputMode="decimal"
              value={newWeight}
              onChange={e => setNewWeight(e.target.value)}
              placeholder={unitSystem === 'metric' ? '75.0' : '165.0'}
              className="flex-1 px-4 py-2.5 text-base focus:outline-none focus:ring-2 focus:ring-brand-500 font-bold rounded-lg"
              style={{ background: '#f8f9fa', border: '2px solid #0f172a', color: '#0f172a' }}
            />
            <span className="flex items-center text-sm font-black px-1" style={{ color: '#94a3b8' }}>{unitSystem === 'metric' ? 'kg' : 'lb'}</span>
            <button
              type="button"
              onClick={logWeight}
              disabled={!newWeight}
              className="px-5 py-2.5 rounded-lg text-white font-black disabled:opacity-40 transition-all"
              style={{ background: '#f97316', border: '2px solid #0f172a', boxShadow: '2px 2px 0px #0f172a' }}
            >
              Log
            </button>
          </div>
          {latestWeight != null && (
            <div className="mt-2 text-sm font-semibold" style={{ color: '#64748b' }}>
              Latest: <strong style={{ color: '#0f172a' }}>{latestDisplay?.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lb'}</strong>
              {change !== null && (
                <span className={`ml-2 font-bold ${Number(change) < 0 ? 'text-teal-600' : Number(change) > 0 ? 'text-red-500' : ''}`}>
                  ({Number(change) > 0 ? '+' : ''}{change} {unitSystem === 'metric' ? 'kg' : 'lb'})
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Weight chart */}
      {chartData.length >= 2 && (
        <div className="rounded-xl mt-4 bg-white overflow-hidden" style={{ border: '2px solid #0f172a', boxShadow: '3px 3px 0px #0f172a' }}>
          <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1.5px solid #f1f5f9', background: '#f8f9fa' }}>
            <TrendingUp size={16} style={{ color: '#f97316' }} />
            <span className="font-black text-sm uppercase tracking-wide" style={{ color: '#0f172a' }}>Weight trend</span>
          </div>
          <div className="p-4">
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickLine={false} />
                <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: 8, border: '2px solid #0f172a', boxShadow: '3px 3px 0px #0f172a', background: '#fff', color: '#0f172a', fontWeight: 700 }}
                  formatter={(value) => {
                    const numeric = typeof value === 'number' ? value : Number(value ?? 0);
                    return [`${Number.isFinite(numeric) ? numeric : 0} ${unitSystem === 'metric' ? 'kg' : 'lb'}`, 'Weight'];
                  }}
                />
                <Line type="monotone" dataKey="weight" stroke="#f97316" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Adaptive target info */}
      {target && (
        <div className="rounded-xl mt-4 bg-white overflow-hidden" style={{ border: '2px solid #0f172a', boxShadow: '3px 3px 0px #0f172a' }}>
          <div className="px-4 py-3" style={{ borderBottom: '1.5px solid #f1f5f9', background: '#f8f9fa' }}>
            <span className="font-black text-sm uppercase tracking-wide" style={{ color: '#0f172a' }}>Current targets</span>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-2.5">
              <StatCard label="Calories" value={`${target.calories} kcal`} />
              <StatCard label="TDEE estimate" value={estimatedTDEE ? `${estimatedTDEE} kcal` : (target.tdeeEstimate ? `${target.tdeeEstimate} kcal` : '—')} />
              <StatCard label="Protein" value={`${target.proteinG}g`} />
              <StatCard label="Carbs" value={`${target.carbG}g`} />
              <StatCard label="Fat" value={`${target.fatG}g`} />
              <StatCard label="Source" value={target.source === 'adaptive' ? 'Adaptive' : 'Initial'} />
            </div>
            {weighIns.length < 7 && (
              <p className="text-xs font-semibold mt-3" style={{ color: '#94a3b8' }}>
                Log your weight for 7+ days to enable adaptive calorie adjustments.
              </p>
            )}
          </div>
        </div>
      )}

      {weighIns.length === 0 && (
        <div className="text-center mt-12">
          <div className="w-14 h-14 rounded-xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#fff7ed', border: '2px solid #0f172a' }}>
            <Scale size={26} style={{ color: '#f97316' }} />
          </div>
          <p className="text-sm font-semibold" style={{ color: '#64748b' }}>Log your weight daily to track progress and enable adaptive targets.</p>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg p-3" style={{ background: '#f8f9fa', border: '1.5px solid #e2e8f0' }}>
      <div className="text-xs font-black uppercase tracking-wide mb-1" style={{ color: '#94a3b8' }}>{label}</div>
      <div className="text-sm font-black" style={{ color: '#0f172a' }}>{value}</div>
    </div>
  );
}
