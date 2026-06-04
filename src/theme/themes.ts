import type { DesignTheme } from '../types';

export const DEFAULT_THEME: DesignTheme = 'dark-fitness';

export const THEME_OPTIONS: Array<{
  value: DesignTheme;
  label: string;
  description: string;
}> = [
  {
    value: 'dark-fitness',
    label: 'Dark Fitness',
    description: 'Deep navy surfaces with neon green accents.',
  },
  {
    value: 'minimal-wellness',
    label: 'Minimal Wellness',
    description: 'Warm cream cards with soft violet accents.',
  },
];

export function resolveThemeName(theme?: DesignTheme): DesignTheme {
  return theme === 'minimal-wellness' ? theme : DEFAULT_THEME;
}
