import { useState, useEffect } from 'react';
import AppShell from '../components/layout/AppShell';
import { getProfile, saveProfile, saveTarget } from '../db/database';
import { buildInitialTarget } from '../domain/macroEngine';
import type { UserProfile, ActivityLevel, GoalType, MacroPreset, Sex, UnitSystem } from '../types';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fromDisplayHeight, fromDisplayPace, fromDisplayWeight, toDisplayHeight, toDisplayPace, toDisplayWeight } from '../utils/units';

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, type = 'text', placeholder }: {
  value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <input
      type={type}
      inputMode={type === 'number' ? 'decimal' : undefined}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
    />
  );
}

function SelectInput({ value, onChange, options }: {
  value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-brand-500"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

export default function SettingsPage() {
  const qc = useQueryClient();

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: getProfile });
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<Partial<UserProfile>>({});

  const unitSystem = (form.unitSystem ?? profile?.unitSystem ?? 'metric') as UnitSystem;

  useEffect(() => {
    if (profile) setForm(profile);
  }, [profile]);

  function set<K extends keyof UserProfile>(key: K, value: UserProfile[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!profile) return;

    const updated: UserProfile = {
      ...profile,
      ...form,
      unitSystem,
      updatedAt: new Date().toISOString(),
    };
    await saveProfile(updated);
    const target = buildInitialTarget(updated);
    await saveTarget(target);
    qc.invalidateQueries({ queryKey: ['profile'] });
    qc.invalidateQueries({ queryKey: ['target'] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  if (!profile) {
    return (
      <AppShell title="Settings">
        <div className="text-center mt-12 text-gray-400 text-sm">No profile found.</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings">
      <div className="flex flex-col gap-5 mt-4 pb-6">
        <Section title="Display units">
          <Field label="Measurement system">
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
              {(['metric', 'imperial'] as UnitSystem[]).map(system => (
                <button
                  key={system}
                  type="button"
                  onClick={() => set('unitSystem', system)}
                  className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                    unitSystem === system
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'text-gray-600 hover:bg-white'
                  }`}
                >
                  {system === 'metric' ? 'Metric' : 'Imperial'}
                </button>
              ))}
            </div>
          </Field>
        </Section>

        {/* Personal */}
        <Section title="Personal">
          <Field label="Name">
            <TextInput value={String(form.name ?? '')} onChange={v => set('name', v)} />
          </Field>
          <Field label="Sex">
            <SelectInput
              value={String(form.sex ?? 'male')}
              onChange={v => set('sex', v as Sex)}
              options={[{ value: 'male', label: 'Male' }, { value: 'female', label: 'Female' }]}
            />
          </Field>
          <Field label="Age (years)">
            <TextInput type="number" value={String(form.age ?? '')} onChange={v => set('age', Number(v))} />
          </Field>
          <Field label={`Height (${unitSystem === 'metric' ? 'cm' : 'in'})`}>
            <TextInput
              type="number"
              value={String(toDisplayHeight(Number(form.heightCm ?? 0), unitSystem) ?? '')}
              onChange={v => set('heightCm', fromDisplayHeight(Number(v || 0), unitSystem))}
            />
          </Field>
          <Field label={`Weight (${unitSystem === 'metric' ? 'kg' : 'lb'})`}>
            <TextInput
              type="number"
              value={String(toDisplayWeight(Number(form.weightKg ?? 0), unitSystem) ?? '')}
              onChange={v => set('weightKg', fromDisplayWeight(Number(v || 0), unitSystem))}
            />
          </Field>
        </Section>

        {/* Activity */}
        <Section title="Activity & Goal">
          <Field label="Activity level">
            <SelectInput
              value={String(form.activityLevel ?? 'moderate')}
              onChange={v => set('activityLevel', v as ActivityLevel)}
              options={[
                { value: 'sedentary', label: 'Sedentary' },
                { value: 'light', label: 'Lightly active' },
                { value: 'moderate', label: 'Moderately active' },
                { value: 'very_active', label: 'Very active' },
                { value: 'extra_active', label: 'Extra active' },
              ]}
            />
          </Field>
          <Field label="Goal">
            <SelectInput
              value={String(form.goalType ?? 'maintain')}
              onChange={v => set('goalType', v as GoalType)}
              options={[
                { value: 'lose', label: 'Lose weight' },
                { value: 'maintain', label: 'Maintain weight' },
                { value: 'gain', label: 'Gain weight' },
              ]}
            />
          </Field>
          {form.goalType !== 'maintain' && (
            <Field label={`Pace (${unitSystem === 'metric' ? 'kg/week' : 'lb/week'})`}>
              <SelectInput
                value={
                  unitSystem === 'metric'
                    ? String(toDisplayPace(Number(form.goalPaceKgPerWeek ?? 0.5), unitSystem))
                    : toDisplayPace(Number(form.goalPaceKgPerWeek ?? 0.5), unitSystem).toFixed(2)
                }
                onChange={v => set('goalPaceKgPerWeek', fromDisplayPace(Number(v || 0), unitSystem))}
                options={
                  unitSystem === 'metric'
                    ? [
                        { value: '0.25', label: '0.25 kg/week (slow)' },
                        { value: '0.5', label: '0.5 kg/week' },
                        { value: '0.75', label: '0.75 kg/week' },
                        { value: '1.0', label: '1.0 kg/week (aggressive)' },
                      ]
                    : [
                        { value: '0.55', label: '0.55 lb/week (slow)' },
                        { value: '1.10', label: '1.10 lb/week' },
                        { value: '1.65', label: '1.65 lb/week' },
                        { value: '2.20', label: '2.20 lb/week (aggressive)' },
                      ]
                }
              />
            </Field>
          )}
        </Section>

        {/* Macros */}
        <Section title="Macro split">
          <Field label="Preset">
            <SelectInput
              value={String(form.macroPreset ?? 'balanced')}
              onChange={v => set('macroPreset', v as MacroPreset)}
              options={[
                { value: 'balanced', label: 'Balanced (30P / 40C / 30F)' },
                { value: 'high_protein', label: 'High protein (35P / 35C / 30F)' },
                { value: 'low_carb', label: 'Low carb (30P / 20C / 50F)' },
              ]}
            />
          </Field>
        </Section>

        {/* API key */}
        <Section title="USDA API key (optional)">
          <p className="text-xs text-gray-400 -mt-1 mb-2">Improves fallback search. Get a free key at fdc.nal.usda.gov.</p>
          <TextInput
            value={localStorage.getItem('usda_api_key') ?? ''}
            onChange={v => { if (v) localStorage.setItem('usda_api_key', v); else localStorage.removeItem('usda_api_key'); }}
            placeholder="DEMO_KEY"
          />
        </Section>

        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3.5 rounded-xl bg-brand-600 text-white font-semibold text-base"
        >
          {saved ? '✓ Saved!' : 'Save changes'}
        </button>

        <button
          type="button"
          onClick={() => { if (confirm('Reset all data?')) { indexedDB.deleteDatabase('CaloriesDB'); location.reload(); } }}
          className="w-full py-3 rounded-xl border border-red-200 text-red-500 text-sm font-medium"
        >
          Reset all data
        </button>
      </div>
    </AppShell>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
