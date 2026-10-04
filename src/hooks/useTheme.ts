import { useEffect, useState } from 'react';
import { useSettingsStore } from '../store/useSettingsStore';

export function useTheme() {
  const theme = useSettingsStore((s) => s.settings.theme);
  const setTheme = useSettingsStore((s) => s.setTheme);

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    return theme === 'dark' || (theme === 'system' && mediaQuery.matches);
  });

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const dark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      setIsDark(dark);

      if (dark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    const handleChange = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  return { theme, setTheme, isDark, toggleTheme };
}
