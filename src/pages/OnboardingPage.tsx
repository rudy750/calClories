import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile, Sex, ActivityLevel, GoalType, MacroPreset, UnitSystem } from '../types';
import { saveProfile } from '../db/database';
import { buildInitialTarget } from '../domain/macroEngine';
import { saveTarget } from '../db/database';
import { fromDisplayHeight, fromDisplayWeight } from '../utils/units';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

const STEPS = ['basics', 'body', 'activity', 'goal', 'macros'] as const;
type Step = typeof STEPS[number];

const STEP_LABELS: Record<Step, string> = {
  basics: 'About You',
  body: 'Your Body',
  activity: 'Activity Level',
  goal: 'Your Goal',
  macros: 'Macro Split',
};

interface Draft {
  name: string;
  sex: Sex;
  unitSystem: UnitSystem;
  age: string;
  heightCm: string;
  weightKg: string;
  activityLevel: ActivityLevel;
  goalType: GoalType;
  goalPaceKgPerWeek: string;
  macroPreset: MacroPreset;
  customProteinPct: string;
  customCarbPct: string;
  customFatPct: string;
}

const DEFAULT_DRAFT: Draft = {
  name: '',
  sex: 'male',
  unitSystem: 'metric',
  age: '',
  heightCm: '',
  weightKg: '',
  activityLevel: 'moderate',
  goalType: 'lose',
  goalPaceKgPerWeek: '0.5',
  macroPreset: 'balanced',
  customProteinPct: '30',
  customCarbPct: '40',
  customFatPct: '30',
};

function optionStyles(active: boolean) {
  return active
    ? { background: 'rgba(0,217,126,0.08)', border: '2px solid #00D97E' }
    : { background: '#0F1525', border: '2px solid #1F2D50' };
}

function Radio<T extends string>({ label, value, selected, onChange }: {
  label: string; value: T; selected: T; onChange: (v: T) => void;
}) {
  const active = selected === value;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`w-full text-left px-4 py-3 rounded-xl font-medium transition-colors ${active ? 'text-brand-500' : 'text-gray-300'}`}
      style={optionStyles(active)}
    >
      {label}
    </button>
  );
}

function NumInput({ label, value, onChange, unit, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; unit?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 text-white"
          style={{ background: '#141D30', border: '1px solid #1F2D50' }}
        />
        {unit && <span className="text-sm text-gray-500 w-8">{unit}</span>}
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('basics');
  const [draft, setDraft] = useState<Draft>(DEFAULT_DRAFT);
  const [saving, setSaving] = useState(false);

  const stepIdx = STEPS.indexOf(step);
  const isFirst = stepIdx === 0;
  const isLast = stepIdx === STEPS.length - 1;

  function set<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft(d => ({ ...d, [key]: value }));
  }

  function next() {
    if (!isLast) setStep(STEPS[stepIdx + 1]);
    else handleFinish();
  }

  function back() {
    if (!isFirst) setStep(STEPS[stepIdx - 1]);
  }

  function canAdvance(): boolean {
    switch (step) {
      case 'basics': return draft.name.trim().length > 0;
      case 'body': return !!draft.age && !!draft.heightCm && !!draft.weightKg;
      case 'activity': return true;
      case 'goal': return true;
      case 'macros': return true;
    }
  }

  async function handleFinish() {
    setSaving(true);
    const now = new Date().toISOString();
    const heightInCm = fromDisplayHeight(Number(draft.heightCm), draft.unitSystem);
    const weightInKg = fromDisplayWeight(Number(draft.weightKg), draft.unitSystem);
    const profile: Omit<UserProfile, 'id'> = {
      name: draft.name.trim(),
      sex: draft.sex,
      age: Number(draft.age),
      heightCm: heightInCm,
      weightKg: weightInKg,
      activityLevel: draft.activityLevel,
      goalType: draft.goalType,
      goalPaceKgPerWeek: Number(draft.goalPaceKgPerWeek),
      unitSystem: draft.unitSystem,
      macroPreset: draft.macroPreset,
      customProteinPct: Number(draft.customProteinPct),
      customCarbPct: Number(draft.customCarbPct),
      customFatPct: Number(draft.customFatPct),
      onboardingComplete: true,
      createdAt: now,
      updatedAt: now,
    };
    await saveProfile(profile);
    const fullProfile = { ...profile, id: 1 as const };
    const target = buildInitialTarget(fullProfile);
    await saveTarget(target);
    navigate('/log');
  }

  return (
    <div className="min-h-screen flex flex-col max-w-lg mx-auto" style={{ background: '#080B14' }}>
      <div className="px-4 pt-10 pb-4">
        <div className="text-xs font-semibold text-brand-500 uppercase tracking-widest mb-1">
          Step {stepIdx + 1} of {STEPS.length}
        </div>
        <h1 className="text-2xl font-bold text-white">{STEP_LABELS[step]}</h1>
        <div className="flex gap-1 mt-3">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={`flex-1 h-1 rounded-full transition-colors ${i <= stepIdx ? 'bg-brand-500' : ''}`}
              style={i <= stepIdx ? undefined : { background: '#1A2540' }}
            />
          ))}
        </div>
      </div>

      <div className="flex-1 px-4 py-2 flex flex-col gap-3">
        {step === 'basics' && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={draft.name}
                onChange={e => set('name', e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-brand-500 text-white"
                style={{ background: '#141D30', border: '1px solid #1F2D50' }}
              />
            </div>
            <div className="flex gap-3">
              {(['male', 'female'] as Sex[]).map(s => (
                <Radio key={s} label={s === 'male' ? 'Male' : 'Female'} value={s} selected={draft.sex} onChange={v => set('sex', v)} />
              ))}
            </div>
            <div className="rounded-2xl p-3" style={{ background: '#0F1525', border: '1px solid #1F2D50' }}>
              <div className="text-sm font-medium text-gray-400 mb-2">Measurement system</div>
              <div className="grid grid-cols-2 gap-2">
                {(['metric', 'imperial'] as UnitSystem[]).map(system => {
                  const active = draft.unitSystem === system;
                  return (
                    <button
                      key={system}
                      type="button"
                      onClick={() => set('unitSystem', system)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${active ? 'text-brand-500' : 'text-gray-300'}`}
                      style={optionStyles(active)}
                    >
                      {system === 'metric' ? 'Metric (kg / cm)' : 'Imperial (lb / in)'}
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {step === 'body' && (
          <>
            <NumInput label="Age" value={draft.age} onChange={v => set('age', v)} unit="yrs" placeholder="25" />
            <NumInput
              label="Height"
              value={draft.heightCm}
              onChange={v => set('heightCm', v)}
              unit={draft.unitSystem === 'metric' ? 'cm' : 'in'}
              placeholder={draft.unitSystem === 'metric' ? '170' : '71'}
            />
            <NumInput
              label="Current weight"
              value={draft.weightKg}
              onChange={v => set('weightKg', v)}
              unit={draft.unitSystem === 'metric' ? 'kg' : 'lb'}
              placeholder={draft.unitSystem === 'metric' ? '75' : '165'}
            />
          </>
        )}

        {step === 'activity' && (
          <div className="flex flex-col gap-2">
            {([
              ['sedentary', 'Sedentary', 'Little or no exercise'],
              ['light', 'Lightly active', 'Exercise 1–3 days/week'],
              ['moderate', 'Moderately active', 'Exercise 3–5 days/week'],
              ['very_active', 'Very active', 'Hard exercise 6–7 days/week'],
              ['extra_active', 'Extra active', 'Very hard exercise & physical job'],
            ] as const).map(([val, label, sub]) => {
              const active = draft.activityLevel === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('activityLevel', val)}
                  className="w-full text-left px-4 py-3 rounded-xl transition-colors"
                  style={optionStyles(active)}
                >
                  <div className={`font-medium ${active ? 'text-brand-500' : 'text-gray-200'}`}>{label}</div>
                  <div className="text-xs text-gray-500">{sub}</div>
                </button>
              );
            })}
          </div>
        )}

        {step === 'goal' && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-2">
              {([
                ['lose', 'Lose weight'],
                ['maintain', 'Maintain weight'],
                ['gain', 'Gain weight / muscle'],
              ] as const).map(([val, label]) => (
                <Radio key={val} label={label} value={val} selected={draft.goalType} onChange={v => set('goalType', v)} />
              ))}
            </div>
            {draft.goalType !== 'maintain' && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Weekly {draft.goalType === 'lose' ? 'loss' : 'gain'} pace
                </label>
                <div className="flex flex-col gap-2">
                  {(['0.25', '0.5', '0.75', '1.0'] as const).map(v => (
                    <Radio
                      key={v}
                      label={`${v} kg / week${v === '0.5' ? ' (recommended)' : ''}`}
                      value={v}
                      selected={draft.goalPaceKgPerWeek}
                      onChange={val => set('goalPaceKgPerWeek', val)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 'macros' && (
          <div className="flex flex-col gap-2">
            {([
              ['balanced', 'Balanced', '30% P / 40% C / 30% F'],
              ['high_protein', 'High protein', '35% P / 35% C / 30% F'],
              ['low_carb', 'Low carb', '30% P / 20% C / 50% F'],
            ] as const).map(([val, label, sub]) => {
              const active = draft.macroPreset === val;
              return (
                <button
                  key={val}
                  type="button"
                  onClick={() => set('macroPreset', val)}
                  className="w-full text-left px-4 py-3 rounded-xl transition-colors"
                  style={optionStyles(active)}
                >
                  <div className={`font-medium ${active ? 'text-brand-500' : 'text-gray-200'}`}>{label}</div>
                  <div className="text-xs text-gray-500">{sub}</div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-4 pb-8 pt-4 flex gap-3">
        {!isFirst && (
          <button
            type="button"
            onClick={back}
            className="flex items-center gap-1 px-4 py-3 rounded-xl font-medium text-gray-300"
            style={{ background: '#0F1525', border: '1px solid #1F2D50' }}
          >
            <ChevronLeft size={18} /> Back
          </button>
        )}
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance() || saving}
          className="flex-1 flex items-center justify-center gap-1 px-4 py-3 rounded-xl bg-brand-600 text-white font-semibold disabled:opacity-40 transition-opacity"
          style={{ boxShadow: '0 0 18px rgba(0,217,126,0.3)' }}
        >
          {isLast ? (
            saving ? 'Saving…' : <><Check size={18} /> Get started</>
          ) : (
            <>Next <ChevronRight size={18} /></>
          )}
        </button>
      </div>
    </div>
  );
}
