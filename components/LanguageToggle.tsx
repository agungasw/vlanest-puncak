'use client';

import { useState, useEffect } from 'react';
import { Globe } from 'lucide-react';

export default function LanguageToggle() {
  const [lang, setLang] = useState<'ID' | 'EN'>('ID');

  useEffect(() => {
    const saved = localStorage.getItem('vlanest_lang') as 'ID' | 'EN';
    if (saved) setLang(saved);
  }, []);

  const toggleLanguage = () => {
    const nextLang = lang === 'ID' ? 'EN' : 'ID';
    setLang(nextLang);
    localStorage.setItem('vlanest_lang', nextLang);
    // Dispatch custom event for reactive language change
    window.dispatchEvent(new Event('language-change'));
  };

  return (
    <button
      onClick={toggleLanguage}
      className="px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-200 dark:border-slate-700 flex items-center gap-1.5 cursor-pointer transition-all"
      title="Switch Language / Ganti Bahasa"
    >
      <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-amber-400" />
      <span>{lang === 'ID' ? '🇮🇩 ID' : '🇬🇧 EN'}</span>
    </button>
  );
}
