import type { DesignTheme } from '../types';

export const DEFAULT_THEME: DesignTheme = 'dark-fitness';

export const THEME_OPTIONS: Array<{
  value: DesignTheme;
  label: string;
  description: string;
  preview: {
    surface: string;
    border: string;
    accent: string;
  };
}> = [
  {
    value: 'dark-fitness',
    label: 'Dark Fitness',
    description: 'Deep navy surfaces with neon green accents.',
    preview: {
      surface: '#080b14',
      border: '#1f2d50',
      accent: '#00d97e',
    },
  },
  {
    value: 'minimal-wellness',
    label: 'Minimal Wellness',
    description: 'Warm cream cards with soft violet accents.',
    preview: {
      surface: '#fdfaf5',
      border: '#ede9fe',
      accent: '#8b5cf6',
    },
  },
];

export function resolveThemeName(theme?: DesignTheme): DesignTheme {
  return theme === 'minimal-wellness' ? theme : DEFAULT_THEME;
}
