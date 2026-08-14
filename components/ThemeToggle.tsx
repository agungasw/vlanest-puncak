'use client';

import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Sync initial state from DOM or LocalStorage
    const isDark = document.documentElement.classList.contains('dark') || document.body.classList.contains('dark');
    const savedTheme = (localStorage.getItem('vlanest_theme') as 'light' | 'dark') || (isDark ? 'dark' : 'light');
    setTheme(savedTheme);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (targetTheme: 'light' | 'dark') => {
    if (targetTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('vlanest_theme', nextTheme);
    applyTheme(nextTheme);
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-400 border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all cursor-pointer shadow-sm flex items-center justify-center shrink-0"
      title={theme === 'light' ? 'Aktifkan Mode Malam (Dark Mode)' : 'Aktifkan Mode Terang (Light Mode)'}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-slate-800" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
}
