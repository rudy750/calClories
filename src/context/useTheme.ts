import { useContext } from 'react';
import { ThemeContext } from './theme-context';
import { DEFAULT_THEME } from '../theme/themes';

export function useTheme() {
  const context = useContext(ThemeContext);
  return context ?? {
    themeName: DEFAULT_THEME,
    previewTheme: null,
    setPreviewTheme: () => {},
  };
}
