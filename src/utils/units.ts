export type UnitSystem = 'metric' | 'imperial';

const KG_TO_LB = 2.2046226218;
const CM_TO_IN = 0.3937007874;

function round(value: number, digits = 1) {
  return Number(value.toFixed(digits));
}

export function toDisplayWeight(kg: number, system: UnitSystem = 'metric'): number {
  return system === 'metric' ? round(kg, 1) : round(kg * KG_TO_LB, 1);
}

export function fromDisplayWeight(value: number, system: UnitSystem = 'metric'): number {
  return system === 'metric' ? round(value, 1) : round(value / KG_TO_LB, 1);
}

export function toDisplayHeight(cm: number, system: UnitSystem = 'metric'): number {
  return system === 'metric' ? round(cm, 0) : round(cm * CM_TO_IN, 1);
}

export function fromDisplayHeight(value: number, system: UnitSystem = 'metric'): number {
  return system === 'metric' ? round(value, 0) : round(value / CM_TO_IN, 1);
}

export function toDisplayPace(kgPerWeek: number, system: UnitSystem = 'metric'): number {
  return system === 'metric' ? round(kgPerWeek, 2) : round(kgPerWeek * KG_TO_LB, 2);
}

export function fromDisplayPace(value: number, system: UnitSystem = 'metric'): number {
  return system === 'metric' ? round(value, 2) : round(value / KG_TO_LB, 2);
}
