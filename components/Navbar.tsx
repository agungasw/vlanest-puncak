import Link from 'next/link';
import { Compass, Calendar, Phone, ShieldCheck } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-[#0b132b]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 text-slate-900 dark:text-white shadow-sm transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo - Ultra Luxury Resort Puncak */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-900 flex items-center justify-center text-amber-300 font-extrabold text-lg shadow-md border border-amber-400/40 group-hover:scale-105 transition-transform">
            VN
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                VlaNest
              </span>
              <span className="text-[10px] font-bold tracking-widest text-emerald-700 dark:text-amber-400 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-300/40 dark:border-amber-400/30 uppercase">
                Resort Puncak
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Private Luxury Villa Collection</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <Link href="/" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors flex items-center gap-2">
            <Compass className="w-4 h-4 text-emerald-600 dark:text-amber-400" />
            Katalog Vila
          </Link>
          <Link href="/#fasilitas" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Fasilitas Premium
          </Link>
          <Link href="/#aturan" className="hover:text-emerald-600 dark:hover:text-amber-400 transition-colors flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            Aturan & Deposit
          </Link>
        </nav>

        {/* Action Controls, Language & Theme Toggle */}
        <div className="flex items-center gap-2.5">
          <LanguageToggle />
          <ThemeToggle />
          <a
            href="https://wa.me/6281298765432?text=Halo%20VlaNest%20Puncak,%20saya%20ingin%20tanya%20ketersediaan%20vila"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold px-4 py-2.5 rounded-full bg-gradient-to-r from-emerald-700 via-emerald-800 to-teal-900 hover:from-emerald-600 hover:to-teal-800 text-white shadow-lg border border-emerald-500/30 transition-all hover:scale-[1.03]"
          >
            <Phone className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Customer Service</span>
          </a>
        </div>
      </div>
    </header>
  );
}
