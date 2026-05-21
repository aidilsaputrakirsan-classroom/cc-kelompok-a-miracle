import { useEffect, useState } from 'react';

export default function useDarkMode() {
  const getInitial = () => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'dark') return true;
      if (saved === 'light') return false;
    } catch (e) {
      // ignore
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };

  const [isDark, setIsDark] = useState(getInitial);

  useEffect(() => {
    const onStorage = () => {
      try {
        const saved = localStorage.getItem('theme');
        if (saved === 'dark') setIsDark(true);
        else if (saved === 'light') setIsDark(false);
      } catch (e) {}
    };

    const mq = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const onMedia = (e) => setIsDark(e.matches);

    window.addEventListener('storage', onStorage);
    if (mq && mq.addEventListener) mq.addEventListener('change', onMedia);

    return () => {
      window.removeEventListener('storage', onStorage);
      if (mq && mq.removeEventListener) mq.removeEventListener('change', onMedia);
    };
  }, []);

  return isDark;
}