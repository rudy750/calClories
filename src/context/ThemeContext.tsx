import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../db/database';
import type { DesignTheme } from '../types';
import { resolveThemeName } from '../theme/themes';

interface ThemeContextValue {
  themeName: DesignTheme;
  previewTheme: DesignTheme | null;
  setPreviewTheme: (theme: DesignTheme | null) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });
  const [previewTheme, setPreviewThemeState] = useState<DesignTheme | null>(null);

  const persistedTheme = resolveThemeName(profile?.theme);
  const themeName = previewTheme ?? persistedTheme;

  useEffect(() => {
    document.documentElement.dataset.theme = themeName;
  }, [themeName]);

  useEffect(() => {
    setPreviewThemeState(null);
  }, [persistedTheme]);

  const setPreviewTheme = useCallback((theme: DesignTheme | null) => {
    setPreviewThemeState(theme ? resolveThemeName(theme) : null);
  }, []);

  const value = useMemo(
    () => ({ themeName, previewTheme, setPreviewTheme }),
    [themeName, previewTheme, setPreviewTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
