import { createContext } from 'react';
import type { DesignTheme } from '../types';

export interface ThemeContextValue {
  themeName: DesignTheme;
  previewTheme: DesignTheme | null;
  setPreviewTheme: (theme: DesignTheme | null) => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);
