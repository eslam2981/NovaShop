import { useEffect } from 'react';
import { useThemeStore, applyThemeClass } from '@/store/themeStore';

/** Keeps `dark` class in sync when preference is System and OS theme changes. */
export function ThemeSync() {
  const preference = useThemeStore((s) => s.preference);

  useEffect(() => {
    applyThemeClass(preference);
  }, [preference]);

  useEffect(() => {
    if (preference !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyThemeClass('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [preference]);

  return null;
}
