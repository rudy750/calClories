import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../db/database';
import type { DesignTheme } from '../types';
import { resolveThemeName } from '../theme/themes';
import { ThemeContext } from './theme-context';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });
  const [previewTheme, setPreviewThemeState] = useState<DesignTheme | null>(null);

  const persistedTheme = resolveThemeName(profile?.theme);
  const activePreviewTheme = previewTheme && previewTheme !== persistedTheme ? previewTheme : null;
  const themeName = activePreviewTheme ?? persistedTheme;

  useEffect(() => {
    document.documentElement.dataset.theme = themeName;
  }, [themeName]);

  const setPreviewTheme = useCallback((theme: DesignTheme | null) => {
    setPreviewThemeState(theme ? resolveThemeName(theme) : null);
  }, []);

  const value = useMemo(
    () => ({ themeName, previewTheme: activePreviewTheme, setPreviewTheme }),
    [themeName, activePreviewTheme, setPreviewTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
