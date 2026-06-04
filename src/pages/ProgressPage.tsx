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
      <div className="rounded-3xl p-5 mt-4" style={{ background: '#ffffff', boxShadow: '0 1px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-2xl flex items-center justify-center" style={{ background: '#f5f3ff' }}>
            <Scale size={16} style={{ color: '#7c3aed' }} />
          </div>
          <span className="font-bold text-sm" style={{ color: '#1c1040' }}>Log weight</span>
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="decimal"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            placeholder={unitSystem === 'metric' ? '75.0' : '165.0'}
            className="flex-1 px-4 py-3 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
            style={{ background: '#fdfaf5', border: '1.5px solid #ede9fe', color: '#1c1040' }}
          />
          <span className="flex items-center text-sm font-medium px-1" style={{ color: '#a89fd4' }}>{unitSystem === 'metric' ? 'kg' : 'lb'}</span>
          <button
            type="button"
            onClick={logWeight}
            disabled={!newWeight}
            className="px-5 py-3 rounded-2xl text-white font-bold disabled:opacity-40 transition-all"
            style={{ background: 'linear-gradient(135deg, #a78bfa, #7c3aed)' }}
          >
            Log
          </button>
        </div>
        {latestWeight != null && (
          <div className="mt-3 text-sm" style={{ color: '#a89fd4' }}>
            Latest: <strong style={{ color: '#7c3aed' }}>{latestDisplay?.toFixed(1)} {unitSystem === 'metric' ? 'kg' : 'lb'}</strong>
            {change !== null && (
              <span className={`ml-2 font-semibold ${Number(change) < 0 ? 'text-emerald-500' : Number(change) > 0 ? 'text-rose-400' : ''}`}>
                ({Number(change) > 0 ? '+' : ''}{change} {unitSystem === 'metric' ? 'kg' : 'lb'})
              </span>
            )}
          </div>
        )}
      </div>

      {/* Weight chart */}
      {chartData.length >= 2 && (
        <div className="rounded-3xl p-5 mt-4" style={{ background: '#ffffff', boxShadow: '0 1px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-2xl flex items-center justify-center" style={{ background: '#f5f3ff' }}>
              <TrendingUp size={16} style={{ color: '#7c3aed' }} />
            </div>
            <span className="font-bold text-sm" style={{ color: '#1c1040' }}>Weight trend</span>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#faf5ff" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#c4b5fd' }} tickLine={false} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#c4b5fd' }} tickLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 16, border: 'none', boxShadow: '0 8px 30px rgba(124,58,237,0.15)', background: '#fff', color: '#1c1040' }}
                formatter={(value) => {
                  const numeric = typeof value === 'number' ? value : Number(value ?? 0);
                  return [`${Number.isFinite(numeric) ? numeric : 0} ${unitSystem === 'metric' ? 'kg' : 'lb'}`, 'Weight'];
                }}
              />
              <Line type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Adaptive target info */}
      {target && (
        <div className="rounded-3xl p-5 mt-4" style={{ background: '#ffffff', boxShadow: '0 1px 8px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)', border: '1px solid rgba(139,92,246,0.08)' }}>
          <div className="font-bold text-sm mb-4" style={{ color: '#1c1040' }}>Current targets</div>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Calories" value={`${target.calories} kcal`} />
            <StatCard label="TDEE estimate" value={estimatedTDEE ? `${estimatedTDEE} kcal` : (target.tdeeEstimate ? `${target.tdeeEstimate} kcal` : '—')} />
            <StatCard label="Protein" value={`${target.proteinG}g`} />
            <StatCard label="Carbs" value={`${target.carbG}g`} />
            <StatCard label="Fat" value={`${target.fatG}g`} />
            <StatCard label="Source" value={target.source === 'adaptive' ? 'Adaptive' : 'Initial'} />
          </div>
          {weighIns.length < 7 && (
            <p className="text-xs mt-3" style={{ color: '#c4b5fd' }}>
              Log your weight for 7+ days to enable adaptive calorie adjustments.
            </p>
          )}
        </div>
      )}

      {weighIns.length === 0 && (
        <div className="text-center mt-16">
          <div className="w-16 h-16 rounded-3xl mx-auto mb-4 flex items-center justify-center" style={{ background: '#f5f3ff' }}>
            <Scale size={28} style={{ color: '#c4b5fd' }} />
          </div>
          <p className="text-sm" style={{ color: '#a89fd4' }}>Log your weight daily to track progress and enable adaptive targets.</p>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl p-3" style={{ background: '#fdfaf5', border: '1px solid #ede9fe' }}>
      <div className="text-xs mb-1" style={{ color: '#a89fd4' }}>{label}</div>
      <div className="text-sm font-bold" style={{ color: '#1c1040' }}>{value}</div>
    </div>
  );
}
