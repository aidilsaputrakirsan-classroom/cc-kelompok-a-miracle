import { useEffect, useState } from 'react';

export default function useDarkMode() {
  const getSystemPreference = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const getSavedTheme = () => {
    try {
      return localStorage.getItem('theme');
    } catch (error) {
      return null;
    }
  };

  const [isDark, setIsDark] = useState(() => {
    const saved = getSavedTheme();
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    return getSystemPreference();
  });
  const [hasUserPreference, setHasUserPreference] = useState(() => {
    const saved = getSavedTheme();
    return saved === 'dark' || saved === 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleMediaChange = (event) => {
      if (!hasUserPreference) {
        setIsDark(event.matches);
      }
    };

    mediaQuery.addEventListener?.('change', handleMediaChange);
    return () => mediaQuery.removeEventListener?.('change', handleMediaChange);
  }, [hasUserPreference]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== 'theme') return;

      if (event.newValue === 'dark') {
        setHasUserPreference(true);
        setIsDark(true);
      } else if (event.newValue === 'light') {
        setHasUserPreference(true);
        setIsDark(false);
      } else {
        setHasUserPreference(false);
        setIsDark(getSystemPreference());
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !isDark;
    setHasUserPreference(true);
    setIsDark(nextDark);
    try {
      localStorage.setItem('theme', nextDark ? 'dark' : 'light');
    } catch (error) {
      // ignore
    }
  };

  return [isDark, toggleDarkMode];
}